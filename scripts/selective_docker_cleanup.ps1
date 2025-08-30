# Selective Docker Cleanup - تنظيف انتقائي للـ Docker builds
# يسمح لك بحذف builds معينة أو الاحتفاظ بأحدث النسخ فقط

param(
    [int]$KeepLatest = 2,  # عدد أحدث الصور المراد الاحتفاظ بها لكل مشروع
    [switch]$DryRun = $false  # معاينة فقط بدون حذف فعلي
)

Write-Host "🔍 تحليل Docker images..." -ForegroundColor Cyan

# الحصول على جميع الصور
$images = docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}" | ConvertFrom-Csv -Delimiter "`t"

# تجميع الصور حسب المشروع
$projectImages = @{}
foreach ($image in $images) {
    if ($image.Repository -match "ai-education-platform|supernova") {
        $project = $image.Repository
        if (-not $projectImages.ContainsKey($project)) {
            $projectImages[$project] = @()
        }
        $projectImages[$project] += $image
    }
}

Write-Host "`n📋 الصور الموجودة حسب المشروع:" -ForegroundColor Yellow

foreach ($project in $projectImages.Keys) {
    Write-Host "`n🏗️ المشروع: $project" -ForegroundColor Green
    $sortedImages = $projectImages[$project] | Sort-Object CreatedAt -Descending
    
    for ($i = 0; $i -lt $sortedImages.Count; $i++) {
        $image = $sortedImages[$i]
        $status = if ($i -lt $KeepLatest) { "✅ سيتم الاحتفاظ" } else { "❌ سيتم الحذف" }
        Write-Host "  $($image.Tag) ($($image.ID)) - $($image.Size) - $status" -ForegroundColor $(if ($i -lt $KeepLatest) { "Green" } else { "Red" })
        
        # حذف الصور القديمة
        if ($i -ge $KeepLatest) {
            if ($DryRun) {
                Write-Host "    [DRY RUN] سيتم حذف: docker rmi $($image.ID)" -ForegroundColor Gray
            } else {
                try {
                    docker rmi $image.ID -f
                    Write-Host "    ✅ تم حذف الصورة: $($image.ID)" -ForegroundColor Green
                } catch {
                    Write-Host "    ⚠️ فشل حذف الصورة: $($image.ID)" -ForegroundColor Yellow
                }
            }
        }
    }
}

# حذف الصور المعلقة (dangling images)
Write-Host "`n🗑️ حذف الصور المعلقة..." -ForegroundColor Yellow
if ($DryRun) {
    $danglingImages = docker images -f "dangling=true" -q
    if ($danglingImages) {
        Write-Host "[DRY RUN] سيتم حذف $($danglingImages.Count) صورة معلقة" -ForegroundColor Gray
    }
} else {
    docker image prune -f
}

Write-Host "`n📊 حالة Docker الحالية:" -ForegroundColor Cyan
docker system df

if ($DryRun) {
    Write-Host "`n💡 هذا كان معاينة فقط. لتنفيذ الحذف الفعلي، شغل الـ script بدون -DryRun" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ تم الانتهاء من التنظيف الانتقائي!" -ForegroundColor Green
}
