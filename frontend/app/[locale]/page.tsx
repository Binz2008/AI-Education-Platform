import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo and Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-600 mb-4">
            منصة التعليم الذكية
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            تعلم مع الذكاء الاصطناعي - رحلة تعليمية ممتعة وآمنة لطفلك
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">وكلاء تعليميون أذكياء</h3>
            <p className="text-gray-600">الأستاذ فصيح، Miss Emily، والشيخ نور</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">آمان وحماية شاملة</h3>
            <p className="text-gray-600">تحكم أبوي كامل وفلترة محتوى عمرية</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">تتبع التقدم</h3>
            <p className="text-gray-600">تقارير مفصلة ونظام مكافآت محفز</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/auth/login"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            تسجيل الدخول
          </Link>
          
          <Link 
            href="/auth/register"
            className="bg-secondary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary-700 transition-colors"
          >
            إنشاء حساب جديد
          </Link>
        </div>

        {/* Agents Preview */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">التقي بمعلميك الأذكياء</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                🧑‍🏫
              </div>
              <h3 className="font-semibold text-lg">الأستاذ فصيح</h3>
              <p className="text-sm text-gray-600">معلم اللغة العربية الصبور</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                👩‍🏫
              </div>
              <h3 className="font-semibold text-lg">Miss Emily</h3>
              <p className="text-sm text-gray-600">English teacher محبوبة</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                🕌
              </div>
              <h3 className="font-semibold text-lg">الشيخ نور</h3>
              <p className="text-sm text-gray-600">معلم التربية الإسلامية الحكيم</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
