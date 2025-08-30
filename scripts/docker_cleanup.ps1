# Docker Cleanup Script - تنظيف Docker builds والصور القديمة
# يقوم بحذف الـ builds والصور غير المستخدمة لتوفير مساحة القرص

Write-Host "🧹 بدء تنظيف Docker..." -ForegroundColor Cyan

# 1. حذف جميع الـ containers المتوقفة
Write-Host "`n📦 حذف الـ containers المتوقفة..." -ForegroundColor Yellow
docker container prune -f

# 2. حذف جميع الصور غير المستخدمة
Write-Host "`n🖼️ حذف الصور غير المستخدمة..." -ForegroundColor Yellow
docker image prune -a -f

# 3. حذف جميع الـ networks غير المستخدمة
Write-Host "`n🌐 حذف الـ networks غير المستخدمة..." -ForegroundColor Yellow
docker network prune -f

# 4. حذف جميع الـ volumes غير المستخدمة
Write-Host "`n💾 حذف الـ volumes غير المستخدمة..." -ForegroundColor Yellow
docker volume prune -f

# 5. حذف build cache
Write-Host "`n🗂️ حذف build cache..." -ForegroundColor Yellow
docker builder prune -a -f

# 6. عرض المساحة المحررة
Write-Host "`n📊 حالة Docker بعد التنظيف:" -ForegroundColor Green
docker system df

Write-Host "`n✅ تم الانتهاء من تنظيف Docker!" -ForegroundColor Green
Write-Host "💡 نصيحة: يمكنك تشغيل هذا الـ script بانتظام لتوفير مساحة القرص" -ForegroundColor Cyan
