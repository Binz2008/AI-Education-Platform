# Simple Docker Build Script - بناء بسيط وموثوق
param(
    [string]$Service = "all"
)

Write-Host "🚀 بدء البناء البسيط للـ Docker..." -ForegroundColor Cyan

# التحقق من وجود docker-compose.yml
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ لم يتم العثور على docker-compose.yml" -ForegroundColor Red
    exit 1
}

# الحصول على قائمة الخدمات باستخدام docker-compose
Write-Host "🔍 جاري الحصول على قائمة الخدمات..." -ForegroundColor Yellow

try {
    $availableServices = docker-compose config --services
    if ($LASTEXITCODE -ne 0) {
        throw "فشل في تشغيل docker-compose config"
    }
    
    $servicesList = $availableServices -split "`n" | Where-Object { $_.Trim() -ne "" }
    Write-Host "📋 الخدمات المتاحة: $($servicesList -join ', ')" -ForegroundColor Green
    
} catch {
    Write-Host "❌ خطأ في الحصول على قائمة الخدمات: $_" -ForegroundColor Red
    Write-Host "💡 سأحاول قراءة docker-compose.yml مباشرة..." -ForegroundColor Yellow
    
    # قراءة مباشرة من الملف كبديل
    $servicesList = @()
    $content = Get-Content "docker-compose.yml"
    $inServices = $false
    
    foreach ($line in $content) {
        if ($line -match "^services:") {
            $inServices = $true
            continue
        }
        if ($inServices -and $line -match "^[a-zA-Z]") {
            $inServices = $false
        }
        if ($inServices -and $line -match "^\s{2}([a-zA-Z][a-zA-Z0-9_-]*):") {
            $servicesList += $matches[1]
        }
    }
    
    if ($servicesList.Count -eq 0) {
        Write-Host "❌ لم يتم العثور على أي خدمات" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📋 الخدمات المتاحة (قراءة مباشرة): $($servicesList -join ', ')" -ForegroundColor Green
}

# تحديد الخدمات المراد بناؤها
$servicesToBuild = @()

switch ($Service.ToLower()) {
    "all" { 
        $servicesToBuild = $servicesList | Where-Object { $_ -in @("backend", "frontend") }
        if ($servicesToBuild.Count -eq 0) {
            Write-Host "⚠️ لا توجد خدمات backend أو frontend، سأبني جميع الخدمات القابلة للبناء" -ForegroundColor Yellow
            # فقط الخدمات التي لها Dockerfile أو build context
            $servicesToBuild = $servicesList | Where-Object { 
                (Test-Path "$_/Dockerfile") -or 
                (Test-Path "backend/Dockerfile" -and $_ -eq "backend") -or 
                (Test-Path "frontend/Dockerfile" -and $_ -eq "frontend")
            }
        }
    }
    default { 
        if ($Service -in $servicesList) {
            $servicesToBuild = @($Service)
        } else {
            Write-Host "❌ الخدمة '$Service' غير متاحة" -ForegroundColor Red
            Write-Host "💡 الخدمات المتاحة: $($servicesList -join ', ')" -ForegroundColor Cyan
            exit 1
        }
    }
}

if ($servicesToBuild.Count -eq 0) {
    Write-Host "⚠️ لا توجد خدمات قابلة للبناء" -ForegroundColor Yellow
    exit 0
}

Write-Host "🏗️ الخدمات المراد بناؤها: $($servicesToBuild -join ', ')" -ForegroundColor Cyan

# بناء الخدمات
foreach ($svc in $servicesToBuild) {
    Write-Host "`n🔨 بناء الخدمة: $svc" -ForegroundColor Green
    
    try {
        docker-compose build $svc
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ تم بناء $svc بنجاح" -ForegroundColor Green
        } else {
            Write-Host "❌ فشل بناء $svc" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ خطأ في بناء $svc`: $_" -ForegroundColor Red
    }
}

Write-Host "`n📊 حالة Docker:" -ForegroundColor Cyan
docker system df

Write-Host "`n✅ انتهى البناء!" -ForegroundColor Green
