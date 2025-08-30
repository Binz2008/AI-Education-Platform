# Optimized Docker Build Script - بناء محسّن لتقليل عدد الـ builds
# يستخدم caching ذكي ويتجنب إعادة البناء غير الضرورية

param(
    [string]$Service = "all",  # الخدمة المراد بناؤها (backend, frontend, all)
    [switch]$NoCache = $false,  # بناء بدون cache
    [switch]$Force = $false     # إجبار إعادة البناء
)

Write-Host "🚀 بدء البناء المحسّن للـ Docker..." -ForegroundColor Cyan

# التحقق من وجود docker-compose.yml
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ لم يتم العثور على docker-compose.yml" -ForegroundColor Red
    exit 1
}

# إعداد متغيرات البيئة
if (Test-Path ".env") {
    Write-Host "📋 تحميل متغيرات البيئة من .env" -ForegroundColor Yellow
} elseif (Test-Path ".env.example") {
    Write-Host "📋 نسخ .env.example إلى .env" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "⚠️ لم يتم العثور على ملف البيئة" -ForegroundColor Yellow
}

# الحصول على قائمة الخدمات المتاحة في docker-compose.yml
$availableServices = @()
try {
    $composeContent = Get-Content "docker-compose.yml" -Raw
    # البحث عن قسم services والخدمات المعرفة تحته
    if ($composeContent -match "services:\s*\r?\n((?:(?:\s{2,}\w+:.*\r?\n?)+))" ) {
        $servicesSection = $matches[1]
        # استخراج أسماء الخدمات فقط (التي تبدأ بمسافتين أو أكثر متبوعة بـ :)
        $availableServices = [regex]::Matches($servicesSection, "^\s{2,}(\w+):", [System.Text.RegularExpressions.RegexOptions]::Multiline) | ForEach-Object { $_.Groups[1].Value }
    }
    
    # إذا لم نجد خدمات، جرب طريقة أخرى باستخدام docker-compose config
    if ($availableServices.Count -eq 0) {
        Write-Host "🔍 محاولة قراءة الخدمات باستخدام docker-compose config..." -ForegroundColor Yellow
        $configOutput = docker-compose config --services 2>$null
        if ($configOutput) {
            $availableServices = $configOutput -split "`n" | Where-Object { $_.Trim() -ne "" }
        }
    }
} catch {
    Write-Host "⚠️ خطأ في قراءة docker-compose.yml: $_" -ForegroundColor Yellow
}

Write-Host "📋 الخدمات المتاحة: $($availableServices -join ', ')" -ForegroundColor Cyan

# تحديد الخدمات المراد بناؤها
$services = @()
switch ($Service.ToLower()) {
    "backend" { 
        if ("backend" -in $availableServices) { $services = @("backend") }
        else { Write-Host "⚠️ خدمة backend غير متاحة في docker-compose.yml" -ForegroundColor Yellow }
    }
    "frontend" { 
        if ("frontend" -in $availableServices) { $services = @("frontend") }
        else { Write-Host "⚠️ خدمة frontend غير متاحة في docker-compose.yml" -ForegroundColor Yellow }
    }
    "all" { 
        $services = $availableServices | Where-Object { $_ -in @("backend", "frontend") }
        if ($services.Count -eq 0) {
            Write-Host "⚠️ لا توجد خدمات backend أو frontend متاحة" -ForegroundColor Yellow
            $services = $availableServices
        }
    }
    default { 
        if ($Service -in $availableServices) { $services = @($Service) }
        else { 
            Write-Host "⚠️ الخدمة '$Service' غير متاحة. الخدمات المتاحة: $($availableServices -join ', ')" -ForegroundColor Yellow
            exit 1
        }
    }
}

foreach ($svc in $services) {
    Write-Host "`n🏗️ بناء الخدمة: $svc" -ForegroundColor Green
    
    # التحقق من التغييرات منذ آخر build
    $needsRebuild = $Force
    
    if (-not $Force) {
        # التحقق من تاريخ آخر تعديل للملفات
        $dockerFile = if ($svc -eq "backend") { "backend/Dockerfile" } else { "frontend/Dockerfile" }
        $sourceDir = if ($svc -eq "backend") { "backend/" } else { "frontend/" }
        
        if (Test-Path $dockerFile) {
            $dockerFileTime = (Get-Item $dockerFile).LastWriteTime
            $latestSourceTime = (Get-ChildItem $sourceDir -Recurse -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
            
            if ($latestSourceTime -gt $dockerFileTime) {
                $needsRebuild = $true
                Write-Host "📝 تم اكتشاف تغييرات في الكود المصدري" -ForegroundColor Yellow
            }
        } else {
            $needsRebuild = $true
        }
    }
    
    # بناء الخدمة
    $buildArgs = @("compose", "build")
    
    if ($NoCache) {
        $buildArgs += "--no-cache"
    }
    
    if ($needsRebuild -or $Force) {
        $buildArgs += "--pull"  # سحب أحدث base images
    }
    
    $buildArgs += $svc
    
    Write-Host "🔨 تنفيذ: docker $($buildArgs -join ' ')" -ForegroundColor Cyan
    
    try {
        & docker @buildArgs
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ تم بناء $svc بنجاح" -ForegroundColor Green
        } else {
            Write-Host "❌ فشل بناء $svc" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ خطأ في بناء $svc`: $_" -ForegroundColor Red
    }
}

# تنظيف build cache القديم
Write-Host "`n🧹 تنظيف build cache القديم..." -ForegroundColor Yellow
docker builder prune -f --filter "until=24h"

Write-Host "`n📊 حالة Docker بعد البناء:" -ForegroundColor Cyan
docker system df

Write-Host "`n✅ انتهى البناء المحسّن!" -ForegroundColor Green
Write-Host "💡 استخدم -Force لإجبار إعادة البناء أو -NoCache لبناء بدون cache" -ForegroundColor Cyan
