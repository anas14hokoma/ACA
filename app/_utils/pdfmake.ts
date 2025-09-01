// app/_utils/pdfmake.ts
// تحميل pdfMake + ربط خطوط Noto Naskh Arabic مرّة واحدة

// @ts-ignore
import pdfMakeImport from 'pdfmake/build/pdfmake';

export async function ensurePdfMakeWithArabicFonts() {
  const pdfMake = (pdfMakeImport as any).default || pdfMakeImport;
  pdfMake.vfs = pdfMake.vfs || {};

  // ✅ الصق هنا نصوص الـBase64 للـ TTF:
  if (!pdfMake.vfs['NotoNaskhArabic-Regular.ttf']) {
    pdfMake.vfs['NotoNaskhArabic-Regular.ttf'] = BASE64_REGULAR;
  }
  if (!pdfMake.vfs['NotoNaskhArabic-Bold.ttf']) {
    pdfMake.vfs['NotoNaskhArabic-Bold.ttf'] = BASE64_BOLD;
  }

  pdfMake.fonts = {
    NotoNaskhArabic: {
      normal: 'NotoNaskhArabic-Regular.ttf',
      bold: 'NotoNaskhArabic-Bold.ttf',
    },
  };

  return pdfMake;
}

// 🧷 الصق هنا الـBase64 الحقيقي (طويل جداً)
const BASE64_REGULAR = `/* ...BASE64 لنُسخة Regular... */`;
const BASE64_BOLD    = `/* ...BASE64 لنُسخة Bold... */`;
