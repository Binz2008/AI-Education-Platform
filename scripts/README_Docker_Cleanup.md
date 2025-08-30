# Docker Cleanup Scripts - أدوات تنظيف Docker

مجموعة من الـ scripts لتنظيف وإدارة Docker builds والصور بكفاءة.

## 📁 الملفات المتوفرة

### 1. `docker_cleanup.ps1` - التنظيف الشامل
ينظف جميع الموارد غير المستخدمة في Docker:
- Containers متوقفة
- Images غير مستخدمة
- Networks غير مستخدمة  
- Volumes غير مستخدمة
- Build cache

```powershell
# تشغيل التنظيف الشامل
.\scripts\docker_cleanup.ps1
```

### 2. `selective_docker_cleanup.ps1` - التنظيف الانتقائي
ينظف builds قديمة مع الاحتفاظ بأحدث النسخ:

```powershell
# معاينة ما سيتم حذفه (بدون حذف فعلي)
.\scripts\selective_docker_cleanup.ps1 -DryRun

# الاحتفاظ بأحدث 3 نسخ لكل مشروع
.\scripts\selective_docker_cleanup.ps1 -KeepLatest 3

# الاحتفاظ بنسخة واحدة فقط
.\scripts\selective_docker_cleanup.ps1 -KeepLatest 1
```

### 3. `optimized_docker_build.ps1` - البناء المحسّن
يبني Docker images بطريقة محسّنة لتقليل عدد الـ builds:

```powershell
# بناء جميع الخدمات
.\scripts\optimized_docker_build.ps1

# بناء الـ backend فقط
.\scripts\optimized_docker_build.ps1 -Service backend

# بناء بدون cache
.\scripts\optimized_docker_build.ps1 -NoCache

# إجبار إعادة البناء
.\scripts\optimized_docker_build.ps1 -Force
```

## 🚀 الاستخدام السريع

### لحل مشكلة كثرة الـ builds:

1. **تنظيف فوري شامل:**
```powershell
.\scripts\docker_cleanup.ps1
```

2. **تنظيف انتقائي (معاينة أولاً):**
```powershell
.\scripts\selective_docker_cleanup.ps1 -DryRun
.\scripts\selective_docker_cleanup.ps1 -KeepLatest 2
```

3. **بناء محسّن للمستقبل:**
```powershell
.\scripts\optimized_docker_build.ps1
```

## 📊 مراقبة استخدام المساحة

```powershell
# عرض استخدام Docker للمساحة
docker system df

# عرض تفاصيل أكثر
docker system df -v
```

## ⚠️ تحذيرات مهمة

- **النسخ الاحتياطية:** تأكد من وجود نسخ احتياطية قبل التنظيف الشامل
- **الـ containers النشطة:** لن يتم حذف الـ containers أو الصور المستخدمة حالياً
- **البيانات:** الـ volumes المستخدمة لن يتم حذفها

## 💡 نصائح للحفاظ على نظافة Docker

1. **تشغيل دوري:** شغل `docker_cleanup.ps1` أسبوعياً
2. **بناء ذكي:** استخدم `optimized_docker_build.ps1` بدلاً من `docker-compose build`
3. **مراقبة المساحة:** راقب `docker system df` بانتظام
4. **استخدام .dockerignore:** تأكد من وجود ملف `.dockerignore` مناسب

## 🔧 استكشاف الأخطاء

### إذا فشل التنظيف:
```powershell
# إيقاف جميع الـ containers
docker stop $(docker ps -q)

# ثم تشغيل التنظيف
.\scripts\docker_cleanup.ps1
```

### إذا كانت المساحة ما زالت ممتلئة:
```powershell
# تنظيف أقوى (احذر!)
docker system prune -a --volumes -f
```
