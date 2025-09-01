import './globals.css';

export const metadata = {
  title: 'هيئة الرقابة الإدارية - دخول',
  description: 'منظومة الاستبيانات الشهرية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      {/* اجعل الصفحة عمود + ارتفاع الشاشة */}
      <body className="min-h-screen flex flex-col bg-white text-[#1A1A1A]">
        {/* ضع هيدر عام هنا إن وُجد */}
        <main className="flex-1">
          {children}
        </main>
        {/* الفوتر العام */}
        <Footer />
      </body>
    </html>
  );
}
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // يدعم الحواف الآمنة في iPhone
};

// استورد مكوّن الفوتر
import Footer from '../components/Footer';
