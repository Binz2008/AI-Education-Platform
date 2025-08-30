'use client'

export default function HomePage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden" dir="rtl">
      <style jsx>{`
        :root {
          --primary-color: #a7f3d0;
          --secondary-color: #fde047;
          --background-color: #f0fdf4;
          --text-primary: #1f2937;
          --text-secondary: #4b5563;
          --accent-color: #d1fae5;
        }
        body {
          font-family: "Cairo", "Poppins", sans-serif;
          background-color: var(--background-color);
          color: var(--text-primary);
        }
      `}</style>
      
      <div>
        <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 shadow-sm">
          <button className="text-[var(--text-primary)]">
            <svg fill="currentColor" height="28px" viewBox="0 0 256 256" width="28px" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
            </svg>
          </button>
          <h1 className="text-[var(--text-primary)] text-xl font-bold leading-tight tracking-tight flex-1 text-center pr-7">منصة التعليم الذكية</h1>
        </header>

        <main>
          <section className="relative">
            <div className="flex min-h-[50vh] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4 text-center" style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBViam6g-Z5PBfG0DYBWQ6v2prOiPVyGwMGGASjCns5r00Uly7Aa3QR65d35djmmGpDKhD_70_JOnH6RfSeQ9XLoypM-Fldk4EeR8CmkQ75B-_xU5EKm_p84rsjRNEzQhwrwlAQEt9EhCLcY5iBsnD-BNYiVXYkZQ8AMTfpALdnZ0uJnC5ChcbGKpxPItOlXtXZ1bA3UeGgv2yAms8DAOUocIMVGC6jPMAkEGhR2jbjBtp9KwrCXKUeNFnjIUJ0AJk6goGfZD8rNz0u")'}}>              <h2 className="text-white text-5xl font-black leading-tight tracking-tighter" style={{fontFamily: "'Cairo', sans-serif"}}>
                منصة التعليم الذكية
              </h2>
              <p className="text-white text-lg font-normal leading-normal">
                اكتشف المستقبل مع المعلمين الافتراضيين
              </p>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <button className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[var(--secondary-color)] text-[var(--text-primary)] text-base font-bold leading-normal tracking-wide shadow-lg transform hover:scale-105 transition-transform">
                  <span className="truncate">تسجيل الدخول</span>
                </button>
                <button className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-white text-[var(--text-primary)] text-base font-bold leading-normal tracking-wide shadow-lg transform hover:scale-105 transition-transform">
                  <span className="truncate">إنشاء حساب</span>
                </button>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-10 px-4 py-12">
            <div className="text-center">
              <h2 className="text-[var(--text-primary)] tracking-tight text-3xl font-bold leading-tight max-w-[720px] mx-auto">
                ميزات التطبيق
              </h2>
              <p className="text-[var(--text-secondary)] text-lg font-normal leading-normal max-w-[720px] mx-auto mt-2">التعليم الذكي للأطفال من سن 4 إلى 12 سنة</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 text-center items-center shadow-md hover:shadow-xl transition-shadow">
                <div className="bg-[var(--accent-color)] p-4 rounded-full">
                  <svg className="text-[var(--text-primary)]" fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-28,16v24H120V152ZM80,164a12,12,0,0,1,12-12h12v24H92A12,12,0,0,1,80,164Zm84,12H152V152h12a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z"></path>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight">الوكلاء الافتراضيون</h3>
                  <p className="text-[var(--text-secondary)] text-base font-normal leading-normal">تعلم مع وكلاء افتراضيين في مختلف المواد</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 text-center items-center shadow-md hover:shadow-xl transition-shadow">
                <div className="bg-[var(--accent-color)] p-4 rounded-full">
                  <svg className="text-[var(--text-primary)]" fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"></path>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight">الأمان والخصوصية</h3>
                  <p className="text-[var(--text-secondary)] text-base font-normal leading-normal">حماية بيانات الأطفال وتحكم الأبوين</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 text-center items-center shadow-md hover:shadow-xl transition-shadow">
                <div className="bg-[var(--accent-color)] p-4 rounded-full">
                  <svg className="text-[var(--text-primary)]" fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176ZM104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[var(--text-primary)] text-lg font-bold leading-tight">متابعة التقدم</h3>
                  <p className="text-[var(--text-secondary)] text-base font-normal leading-normal">متابعة تقدم الأبناء وتحسين المستوى</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white py-12">
            <h2 className="text-[var(--text-primary)] text-3xl font-bold tracking-tight px-4 pb-6 text-center">تعرف على معلميك</h2>
            <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4">
              <div className="flex items-stretch gap-6 pb-4">
                <div className="flex flex-col gap-4 text-center rounded-lg min-w-40 items-center">
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full flex flex-col self-center w-32 h-32 border-4 border-[var(--primary-color)] shadow-lg" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDD0ag-VyGTBBgO2j2tqb4600wH7tp6jMlk7QE4sQow30sF5ri3etWob7ikZUknT3DVbmmx0WzEKZH8Rx862MS6x-QhV1XYW_TiULg2GqdmtYpICIQzWH59b8jom5v8NBC7HG3iAwE2fbR37KFiJgSIVPmZTHqtTqjwd2yTXUZncua_dyviQydvIrqIrjF5Via0uteM9-gUYJnXZc8M3fkGXDJ_K-T69nTbGjk3sdiiatJqY3yAtSb-E96e8SJOaoV9bQQ4YbszqWkn")'}}></div>
                  <p className="text-[var(--text-primary)] text-lg font-medium leading-normal">معلم اللغة العربية</p>
                </div>
                <div className="flex flex-col gap-4 text-center rounded-lg min-w-40 items-center">
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full flex flex-col self-center w-32 h-32 border-4 border-[var(--primary-color)] shadow-lg" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLgQakyr-STlUJ33Is4ON8oXhGloRSRQJVp_1TOg1QxdnP647F7jY2TWued2NxDY073DAjn4z8XjozjthkEovXN7lox849024lhy2C62HcJWDqym5wqjH3gnCruMPfOZEQpQliwlbSEBN4OdTCmUIjZea4qX_j0YLhUkFAdKnv_I6qyBLSCxnaIJGAwkSrAyf04u4u2VVblXdrVV7_bBx5WkHjhsmsukwS6EWxA1NpY6H_uhFI72LRn7dFYXk9sw2t2L-__iDJoHcG")'}}></div>
                  <p className="text-[var(--text-primary)] text-lg font-medium leading-normal">معلم اللغة الإنجليزية</p>
                </div>
                <div className="flex flex-col gap-4 text-center rounded-lg min-w-40 items-center">
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full flex flex-col self-center w-32 h-32 border-4 border-[var(--primary-color)] shadow-lg" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAbbwjK3npJq9Q0NTB9-4TeS-_gotZrK0G-B3uiq3Amt9qlLW7u7HRHL2iAB7RgRK0QOMC8PqQs7GRtW-lCQDTihGr4UfdaN4_S7NgblsWGWnrmLKWD5D39xMR7ofE6ZMLHP_VrlH3QPObVPELAhO64RZFs6g7TYhHRbXhpBV6f4vzM_-JQOy9xR-e8FcsizP3kHxrzXykRrpFm2Sl2tFGpbe-1CsrMbWyfXp48U7rgAZQQzAdpLNVVce6P9A_YINFJVs4VGE9ohayK")'}}></div>
                  <p className="text-[var(--text-primary)] text-lg font-medium leading-normal">معلم الدراسات الإسلامية</p>
                </div>
                <div className="flex flex-col gap-4 text-center rounded-lg min-w-40 items-center">
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full flex flex-col self-center w-32 h-32 border-4 border-[var(--primary-color)] shadow-lg" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCNtCHPxFgAHJQgTS9MdxPp8cajtNljJIvhgd420yWYS7pR1t2l4orH4KHZMhkQ6wwz4ZfvZrmYW35tutEYAwu2c35k0iIlWs96mm2fBJyVmvqCwZFtx79vdQCM5lFqOzuVGEcd5-ZHa1hatuB41mBdnLe2XZ71rsunCmUpHduR1Bt-ptjXHurD5FmBv7hvw9NXBph67CSnfSR7hLWbBhVAX1ujjfmqCEjTkUCh6IiNeg_CJSt6NUlApP4LYhCBt_GPq_TzqNpuGVUi")'}}></div>
                  <p className="text-[var(--text-primary)] text-lg font-medium leading-normal">معلم العلوم</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="sticky bottom-0 bg-white shadow-t-md">
        <nav className="flex gap-2 border-t border-gray-100 px-4 pt-2 pb-3">
          <a className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-[var(--primary-color)]" href="#">
            <div className="flex h-8 items-center justify-center">
              <svg fill="currentColor" height="28px" viewBox="0 0 256 256" width="28px" xmlns="http://www.w3.org/2000/svg">
                <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path>
              </svg>
            </div>
            <p className="text-xs font-medium leading-normal tracking-wide">الإعدادات</p>
          </a>
        </nav>
      </footer>
    </div>
  )
}
