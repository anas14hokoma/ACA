// app/_utils/survey-export.ts
import { ensurePdfMakeWithArabicFonts } from '../_utils/pdfmake';

const safe = (v: any) => (v == null ? '—' : String(v));
const num  = (v: any) => { const n = Number(v ?? 0); return isFinite(n) ? n : 0; };
const sanitizeFileName = (name: string) =>
  String(name).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').slice(0, 120);

const tableGridLayout = () => ({
  fillColor: (rowIndex: number) => (rowIndex && rowIndex % 2 === 0 ? '#FAFAFA' : null),
  hLineColor: '#DDD',
  vLineColor: '#DDD',
  paddingTop: 5, paddingBottom: 5, paddingLeft: 6, paddingRight: 6,
});

// fallback لبناء استبيان كامل من صف بسيط
export function buildFullSurveyFromRow(row: any) {
  const today  = (row?.submittedAt ? new Date(row.submittedAt) : new Date()).toISOString().slice(0,10);
  const total  = Number(row?.topics?.total  ?? 0);
  const done   = Number(row?.topics?.done   ?? 0);
  const remain = Number(row?.topics?.remain ?? Math.max(total - done, 0));
  return {
    branch: row.branch || 'طرابلس',
    fullName: row.employeeName || '—',
    cycle: row.cycle || '—',
    role: 'موظف فني',
    department: row.department || '—',
    degree: '—',
    major: '—',
    prev: Math.max(total - done, 0) > remain ? remain : 0,
    monthly: total, total, done, remain,
    notes: '',
    tasks: [{ subject: 'مراجعة ملف', durationDays: 5, assignDate: today, doneDate: '', remark: '' }],
    topicsPrev: 0, topicsMonthly: total, topicsTotal: total, topicsDone: done, topicsRemain: remain, topicsNotes: '',
    topics: [{ number: row.id, summary: 'موضوع عام مرتبط بالاستبيان', assignDate: today, actionDate: '', actionType: 'متابعة' }],
    remainingTopics: remain>0 ? [{ number: '—', summary: 'موضوع متبقٍ', assignDate: today, actionType: 'قيد الإنجاز' }] : [],
    reasonsJustifications: remain>0 ? 'نواقص بسيطة قيد الاستكمال.' : '',
    challengesDifficulties: '',
  };
}

export async function exportFullSurveyToPDF(row: any) {
  if (!row) return;
  const survey = (row?.survey ?? buildFullSurveyFromRow(row));
  const pdfMake = await ensurePdfMakeWithArabicFonts();

  const tasksBody = (survey.tasks || []).length ? ([
    [{ text: 'موضوع التكليف', style: 'th' },{ text: 'مدة التكليف', style: 'th' },
     { text: 'تاريخ التكليف', style: 'th' },{ text: 'تاريخ الإنجاز', style: 'th' },{ text: 'ملاحظات', style: 'th' }],
    ...(survey.tasks || []).map((t: any) => [safe(t.subject), safe(t.durationDays), safe(t.assignDate), safe(t.doneDate || '—'), safe(t.remark)])
  ]) : [[{ text: 'لا توجد بيانات', colSpan: 5, alignment: 'center', color: '#777' }, {}, {}, {}, {}]];

  const topicsBody = (survey.topics || []).length ? ([
    [{ text: 'رقم الموضوع', style: 'th' },{ text: 'ملخص الموضوع', style: 'th' },
     { text: 'تاريخ التكليف', style: 'th' },{ text: 'تاريخ التصرف', style: 'th' },{ text: 'نوع التصرف', style: 'th' }],
    ...(survey.topics || []).map((t: any) => [safe(t.number), safe(t.summary), safe(t.assignDate), safe(t.actionDate || '—'), safe(t.actionType)])
  ]) : [[{ text: 'لا توجد بيانات', colSpan: 5, alignment: 'center', color: '#777' }, {}, {}, {}, {}]];

  const remainingBody = (survey.remainingTopics || []).length ? ([
    [{ text: 'رقم', style: 'th' },{ text: 'ملخص', style: 'th' },{ text: 'تاريخ التكليف', style: 'th' },{ text: 'نوع التصرف', style: 'th' }],
    ...(survey.remainingTopics || []).map((t: any) => [safe(t.number), safe(t.summary), safe(t.assignDate), safe(t.actionType)])
  ]) : [[{ text: 'لا توجد بيانات', colSpan: 4, alignment: 'center', color: '#777' }, {}, {}, {}]];

  const header = {
    columns: [
      { image: '../../logo.png', width: 70, alignment: 'right', margin: [0, 0, 10, 0] },
      { stack: [{ text: 'هيئة الرقابة الإدارية', style: 'hdrTitleAr' }, { text: 'Administrative Control Authority', style: 'hdrTitleEn' }], alignment: 'center' },
      { text: 'مكتب التفتيش وتقييم الأداء', style: 'dept', alignment: 'left' },
    ],
    margin: [0, 0, 0, 6],
  };
  const goldDivider = { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 800, y2: 0, lineWidth: 2, lineColor: '#C9A63C' }], margin: [0, 4, 0, 8] };

  const metaTable = {
    table: {
      widths: [90, '*', 90, '*'],
      body: [
        [{ text: 'الاسم', style: 'kvLabel' }, { text: safe(survey.fullName || '—') },
         { text: 'الفرع', style: 'kvLabel' }, { text: safe(survey.branch || '—') }],
        [{ text: 'الشهر/السنة', style: 'kvLabel' }, { text: safe(survey.cycle || '—') },
         { text: 'الصفة', style: 'kvLabel' }, { text: safe(survey.role || '—') }],
        [{ text: 'الإدارة', style: 'kvLabel' }, { text: safe(survey.department || '—') },
         { text: 'المؤهل', style: 'kvLabel' }, { text: safe(survey.degree || '—') }],
        [{ text: 'التخصص', style: 'kvLabel' }, { text: safe(survey.major || '—') }, { text: '', border: [false,false,false,false] }, { text: '', border: [false,false,false,false] }],
      ],
    },
    layout: 'lightHorizontalLines',
    margin: [0, 4, 0, 10],
  };

  const committeesSummary = {
    table: {
      widths: ['*','*','*','*','*'],
      body: [[
        { text: 'المرحّل من الشهر السابق', style: 'th' },
        { text: 'الوارد الشهري', style: 'th' },
        { text: 'المجموع', style: 'th' },
        { text: 'المنجز', style: 'th' },
        { text: 'المتبقي', style: 'th' },
      ], [num(survey.prev), num(survey.monthly), num(survey.total), num(survey.done), num(survey.remain)]],
    },
    layout: tableGridLayout(),
    margin: [0,6,0,10],
  };

  const docDefinition: any = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [24,24,24,28],
    pageDirection: 'rtl',
    defaultStyle: { font: 'NotoNaskhArabic', fontSize: 11, alignment: 'right' },
    styles: {
      hdrTitleAr: { fontSize: 18, bold: true, alignment: 'center' },
      hdrTitleEn: { fontSize: 10, color: '#444', alignment: 'center' },
      dept: { fontSize: 12, bold: true, color: '#333' },
      h1: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 6, 0, 2] },
      h2: { fontSize: 12.5, bold: true, color: '#7A5A0A', margin: [0, 10, 0, 6] },
      th: { bold: true, fillColor: '#FFF7E6', color: '#7A5A0A', alignment: 'center' },
      kvLabel: { bold: true, color: '#444' },
      box: { margin: [0, 4, 0, 6] },
    },
    images: {
      // لو عندك شعار Base64 ضيفه هنا
      // logoPng: 'data:image/png;base64,....'
    },
    content: [
      header, goldDivider,
      { text: 'الإحصائية الشهرية', style: 'h1' },
      { text: 'لأعمال ونشاط الأعضاء والموظفين الفنيين بفروع الهيئة', style: 'h1' },
      { text: 'البيانات الأساسية', style: 'h2' }, metaTable,
      { text: 'أولا : اللجان المعروضة', style: 'h2' }, committeesSummary,
      { text: 'كشف اللجان خلال الشهر', style: 'h2' }, { table: { widths: ['*','*','*','*','*'], body: tasksBody }, layout: tableGridLayout() },
      { text: 'ثانيا : الموضوعات المعروضة', style: 'h2' }, { table: { widths: ['*','*','*','*','*'], body: topicsBody }, layout: tableGridLayout() },
      { text: 'ثالثا : الموضوعات المتبقية (غير المنجزة ) خلال الشهر', style: 'h2' }, { table: { widths: ['*','*','*'], body: remainingBody }, layout: tableGridLayout() },
      ...(survey.notes ? [{ text: 'ملاحظات', style: 'h2' }, { text: safe(survey.notes), style: 'box' }] : []),
      ...((survey.reasonsJustifications || survey.challengesDifficulties) ? [
        { text: 'أسباب ومبررات عدم إنجاز الموضوعات', style: 'h2' },
        { text: safe(survey.reasonsJustifications || '—'), style: 'box' },
        { text: 'المشاكل والصعوبات', style: 'h2' },
        { text: safe(survey.challengesDifficulties || '—'), style: 'box' },
      ] : []),
    ],
  };

  const safeId = sanitizeFileName(String(row.id || 'بدون-كود'));
  pdfMake.createPdf(docDefinition).download(`استبيان-${safeId}.pdf`);
}
