// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;
  const { pathname } = url;

  const PUBLIC_PATHS = [
    '/login',
    '/favicon.ico',
    '/logo.png',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json',
    '/_next',    // ملفات Next الثابتة
    '/assets',   // ملفات الأصول
  ];

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthed = req.cookies.get('auth')?.value === '1';

  // لو مش مسار عام وما فيه كوكي auth → رجع المستخدم لـ /login
  if (!isPublic && !isAuthed) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // لو في /login وهو مسجل دخول → رجّعه للرئيسية
  if (pathname === '/login' && isAuthed) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ضروري تعريف الـ config عشان يشتغل على المسارات المطلوبة
export const config = {
  matcher: ['/((?!api/health).*)'],
};
