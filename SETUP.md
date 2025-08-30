# دليل التشغيل السريع
## Quick Setup Guide

### 🚀 بدء التشغيل في 5 دقائق

#### 1. تحضير البيئة
```bash
# نسخ ملف البيئة
cp .env.example .env

# تعديل المتغيرات المطلوبة في .env
# - DATABASE_URL
# - REDIS_URL  
# - OPENAI_API_KEY (مطلوب)
# - JWT_SECRET_KEY (غيّر في الإنتاج)
```

#### 2. تثبيت المكتبات
```bash
# في المجلد الرئيسي
npm install

# تثبيت مكتبات Frontend
cd frontend && npm install && cd ..

# تثبيت مكتبات Backend
cd backend && pip install -r requirements.txt && cd ..

# بناء Schemas المشتركة
cd packages/schemas && npm run build && cd ../..
```

#### 3. تشغيل قواعد البيانات
```bash
# تشغيل PostgreSQL + Redis
docker-compose up -d postgres redis

# انتظار 30 ثانية لتهيئة قواعد البيانات
```

#### 4. تشغيل التطبيق
```bash
# تشغيل Frontend + Backend معاً
npm run dev

# أو تشغيل منفصل:
# npm run dev:frontend  # البورت 3000
# npm run dev:backend   # البورت 8000
```

#### 5. الوصول للتطبيق
- **التطبيق**: http://localhost:3000
- **API Docs**: http://localhost:8000/api/v1/docs
- **قاعدة البيانات**: localhost:5432
- **Redis**: localhost:6379

---

### 📋 اختبار سريع للمكونات

#### اختبار API
```bash
curl http://localhost:8000/health
# يجب أن يرجع: {"status": "healthy"}
```

#### اختبار قاعدة البيانات
```bash
# دخول لقاعدة البيانات
psql -h localhost -U dev_user -d ai_education
# كلمة المرور: dev_password
```

#### اختبار Redis
```bash
redis-cli -h localhost ping
# يجب أن يرجع: PONG
```

---

### 🔧 إعداد Production

#### 1. متغيرات البيئة المطلوبة
```env
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-production-jwt-key
OPENAI_API_KEY=your-real-openai-key
DATABASE_URL=your-production-db-url
REDIS_URL=your-production-redis-url
DEBUG=false
```

#### 2. نشر على AWS
```bash
# بناء وتحضير للنشر
npm run build

# رفع Docker images
docker build -t ai-education-backend ./backend
docker build -t ai-education-frontend ./frontend

# نشر على ECS/Fargate
# (تفاصيل أكثر في docs/deployment.md)
```

---

### 🎯 خطة التطوير M0 (أول أسبوعين)

#### الأسبوع الأول
- [x] ✅ إعداد المشروع الأساسي
- [ ] ⏳ تنفيذ Authentication (Guardian/Child)
- [ ] ⏳ إنشاء صفحات تسجيل الدخول والتسجيل
- [ ] ⏳ إعداد قاعدة البيانات الأولية

#### الأسبوع الثاني  
- [ ] ⏳ بناء واجهة المحادثة الأساسية
- [ ] ⏳ تفعيل Arabic Agent (الأستاذ فصيح)
- [ ] ⏳ تطبيق TTS/STT أساسي
- [ ] ⏳ لوحة تحكم Guardian بسيطة

---

### 🤖 الوكلاء الجاهزون

#### الأستاذ فصيح (العربية)
- النبرة: صبور ومشجع
- التركيز: الحروف والكلمات الأساسية
- الميزات: تشجيع مستمر، أمثلة بسيطة

#### Miss Emily (الإنجليزية)  
- النبرة: ودودة ومحفزة
- التركيز: مفردات Pre-A1 الأساسية
- الميزات: خلط العربي/الإنجليزي للشرح

#### الشيخ نور (التربية الإسلامية)
- النبرة: حكيم وهادئ
- التركيز: القيم والأخلاق الأساسية
- الميزات: قصص قصيرة، تطبيق عملي

---

### 🔒 سياسات الأمان المطبقة

#### حماية البيانات
- تشفير at-rest وin-transit
- سياسات محو بعد 30 يوم للمحادثات
- تسجيل audit لكل تفاعل AI

#### التحكم الأبوي
- حدود وقت يومية قابلة للتخصيص
- تفعيل/تعطيل الصوت والمحادثة
- اختيار المواد التعليمية المسموحة

#### فلترة المحتوى
- مناسب للعمر تلقائياً
- فلترة الكلمات غير المناسبة
- التركيز التعليمي الإجباري

---

### 📞 الدعم والمساعدة

#### في حالة المشاكل
1. تحقق من ملف `.env`
2. تأكد من تشغيل قواعد البيانات
3. راجع logs في `backend/app.log`
4. اختبر API endpoints منفردة

#### التطوير التالي
- إضافة المزيد من الأنشطة التفاعلية
- تحسين خوارزميات التقييم
- إضافة ميزات gamification
- تطوير تطبيق موبايل

🎉 **مبروك! المشروع جاهز للتطوير والتشغيل**
