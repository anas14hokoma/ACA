'use client';
// استيراد ديناميكي لمكونات recharts بدون SSR
import dynamic from 'next/dynamic';

// ==== استيراد Recharts ديناميكيًا بدون SSR (مرة واحدة أعلى الملف) ====
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const BarChart           = dynamic(() => import('recharts').then(m => m.BarChart),           { ssr: false });
const Bar                = dynamic(() => import('recharts').then(m => m.Bar),                { ssr: false });
const XAxis              = dynamic(() => import('recharts').then(m => m.XAxis),              { ssr: false });
const YAxis              = dynamic(() => import('recharts').then(m => m.YAxis),              { ssr: false });
const CartesianGrid      = dynamic(() => import('recharts').then(m => m.CartesianGrid),      { ssr: false });
const Tooltip            = dynamic(() => import('recharts').then(m => m.Tooltip),            { ssr: false });
const Legend             = dynamic(() => import('recharts').then(m => m.Legend),             { ssr: false });
const PieChart           = dynamic(() => import('recharts').then(m => m.PieChart),           { ssr: false });
const Pie                = dynamic(() => import('recharts').then(m => m.Pie),                { ssr: false });
const Cell               = dynamic(() => import('recharts').then(m => m.Cell),               { ssr: false });

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import localFont from 'next/font/local';
import { Toaster, toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShieldCheck, Info, X, Search, ChevronDown, Eye, Undo2, Archive,
  Download, Inbox, FileSpreadsheet
} from 'lucide-react';

/* خط الديواني (ضع الخط في public/fonts/Diwani.ttf) */
const diwani = localFont({
  src: '../../public/fonts/Diwani.ttf',
  display: 'swap',
});

/* ========== أدوات UI عامة ========== */
function ActionButton({ variant='ghost', icon: Icon, children, onClick, ...props }) {
  const base = 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm';
  const styles = {
    ghost: 'border border-black/10 bg-white/80 hover:bg-white',
    solid: 'bg-aca-gray text-white hover:opacity-95',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    warn: 'bg-yellow-500 text-white hover:bg-yellow-600',
  };
  return (
    <button type="button" onClick={onClick} className={twMerge(base, styles[variant])} {...props}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
function EmptyState({ title, subtitle }) {
  return (
    <div className="grid place-items-center p-10 text-center">
      <div className="max-w-md rounded-2xl border border-black/10 bg-white/60 p-8">
        <div className="mb-2 flex items-center justify-center gap-2 text-aca-gray">
          <Info size={18} />
          <strong>{title}</strong>
        </div>
        <p className="text-sm text-neutral-600">{subtitle}</p>
      </div>
    </div>
  );
}
function Dot({ color='bg-yellow-400' }) {
  return <span className={twMerge('inline-block h-2.5 w-2.5 rounded-full', color)} />;
}
function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-2xl border border-black/10 bg-white shadow-xl"
            initial={{ scale: .96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: .96, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-black/10 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-aca-gray">{title}</h3>
                <button onClick={onClose} aria-label="إغلاق" className="rounded-md border border-black/10 bg-white/80 p-1.5 hover:bg-white">
                  <X size={16} />
                </button>
              </div>
              {/* شريط معلومات سريع أسفل العنوان (استعمالي) */}
              <div className="flex flex-wrap gap-2">
                <LegendPill color="bg-[#EEE8D5]" text="ملاحظة مدير الإدارة" dot="bg-[#B58900]" />
                <LegendPill color="bg-[#E8F5E9]" text="ملاحظة مدير الفرع" dot="bg-[#2E7D32]" />
                <LegendPill color="bg-[#E3F2FD]" text="خلاصة" dot="bg-[#1565C0]" />
              </div>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function LegendPill({ text, color, dot }) {
  return (
    <span className={twMerge('inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs', color)}>
      <span className={twMerge('h-2 w-2 rounded-full', dot)} />
      {text}
    </span>
  );
}

/* وقت ثابت لتفادي Hydration mismatch */
function formatUtc(ts) {
  const d = new Date(ts);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi} UTC`;
}

/* شارة الحالة — مدير الفرع */
function StatusBadge({ status, className }) {
  const map = {
    awaiting_branch:      { label: 'بانتظار مدير الفرع',    dot: 'bg-yellow-400', text: 'text-yellow-800', bg: 'bg-yellow-50' },
    returned_to_manager:  { label: 'مُرجعة لمدير الإدارة',   dot: 'bg-red-500',    text: 'text-red-800',    bg: 'bg-red-50' },
    sent_to_unit:         { label: 'أُرسلت للوحدة',          dot: 'bg-blue-500',   text: 'text-blue-800',   bg: 'bg-blue-50' },
    returned_from_unit:   { label: 'مُرتجعة من الوحدة',      dot: 'bg-emerald-500',text: 'text-emerald-900',bg: 'bg-emerald-50' },
    sent_to_inspection:   { label: 'أُحيل للتفتيش',          dot: 'bg-purple-500', text: 'text-purple-900', bg: 'bg-purple-50' },
  };
  const s = map[status] || map.awaiting_branch;
  return (
    <span className={twMerge('inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium', s.bg, s.text, className)}>
      <span className={twMerge('h-2.5 w-2.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}
function SectionHeader({ title, hint, icon: Icon }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {Icon && <Icon size={18} className="text-aca-gray" />}
      <div>
        {hint && <div className="text-xs text-neutral-600">{hint}</div>}
        <h3 className="text-lg font-semibold text-aca-gray">{title}</h3>
      </div>
    </div>
  );
}
function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-4">
      {title && <div className="mb-2 font-semibold text-aca-gray">{title}</div>}
      {children}
    </div>
  );
}
function KV({ label, value }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="min-w-28 text-neutral-500">{label}</span>
      <span className="font-medium text-aca-gray">{value || '—'}</span>
    </div>
  );
}
function SimpleTable({ columns = [], rows = [], getKey }) {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white/60">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/70">
            <tr className="border-b border-black/10">
              {columns.map((c) => (
                <th key={c.key} className="p-2 text-right whitespace-nowrap">{c.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="p-3 text-center text-neutral-500">لا توجد بيانات</td></tr>
            ) : rows.map((r, i) => (
              <tr key={getKey ? getKey(r, i) : i} className={twMerge('border-t border-black/5', i%2===0?'bg-white/60':'bg-white/40')}>
                {columns.map((c) => (
                  <td key={c.key} className="p-2 align-top whitespace-pre-wrap">{c.render ? c.render(r) : r[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====== مكون مُوحد لعرض ملاحظات القيادات بشكل واضح ====== */
function LeadershipNotes({ managerNote, branchManagerNote }) {
  const hasManager = !!(managerNote && managerNote.trim());
  const hasBranch  = !!(branchManagerNote && branchManagerNote.trim());
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-[#E5D7A6] bg-[#FFF9E6] p-3">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#8C6D00]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#B58900]" />
          ملاحظة مدير الإدارة
        </div>
        <div className="whitespace-pre-wrap text-sm text-[#5F4B00]">{hasManager ? managerNote : '—'}</div>
      </div>
      <div className="rounded-xl border border-[#BFE6C1] bg-[#F1FFF3] p-3">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#1B5E20]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#2E7D32]" />
          ملاحظة مدير الفرع
        </div>
        <div className="whitespace-pre-wrap text-sm text-[#10491A]">{hasBranch ? branchManagerNote : '—'}</div>
      </div>
    </div>
  );
}

/* ====== معاينة الاستبيان (مع دمج الملاحظات كـ "تكملة") ====== */
function SurveyPreview({ survey, managerNote, branchManagerNote }) {
  if (!survey) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        لا توجد نسخة كاملة من الاستبيان لهذا العنصر.
      </div>
    );
  }
  const {
    branch, fullName, cycle, role, department, degree, major,
    prev, monthly, total, done, remain, notes, tasks = [],
    topicsPrev, topicsMonthly, topicsTotal, topicsDone, topicsRemain, topicsNotes, topics = [],
    remainingTopics = [], reasonsJustifications, challengesDifficulties
  } = survey;

  return (
    <div className="space-y-6">
      {/* تكملة الاستبيان: ملاحظات القيادة دائماً في الأعلى لتكون واضحة */}
      <SectionCard title="تكملة الاستبيان — ملاحظات القيادة">
        <LeadershipNotes managerNote={managerNote} branchManagerNote={branchManagerNote} />
      </SectionCard>

      <SectionCard title="البيانات الأساسية">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <KV label="الاسم" value={fullName} />
          <KV label="الفرع" value={branch} />
          <KV label="الشهر/السنة" value={cycle} />
          <KV label="الوظيفة" value={role} />
          <KV label="الإدارة" value={department} />
          <KV label="المؤهل" value={degree} />
          <KV label="التخصص" value={major} />
        </div>
      </SectionCard>

      <SectionCard title="اللجان المعروضة">
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <KV label="المرحّل" value={prev} />
          <KV label="الوارد الشهري" value={monthly} />
          <KV label="المجموع" value={total} />
          <KV label="المنجز" value={done} />
          <KV label="المتبقي" value={remain} />
        </div>
        {notes && <div className="mb-3 text-sm text-neutral-700"><span className="text-neutral-500">ملاحظات: </span>{notes}</div>}
        <SimpleTable
          columns={[
            { key: 'subject',     title: 'موضوع التكليف' },
            { key: 'durationDays',title: 'المدة (يوم)' },
            { key: 'assignDate',  title: 'تاريخ التكليف' },
            { key: 'doneDate',    title: 'تاريخ الإنجاز' },
            { key: 'remark',      title: 'ملاحظات' },
          ]}
          rows={tasks}
          getKey={(r, i) => `${r.subject || ''}-${i}`}
        />
      </SectionCard>

      <SectionCard title="الموضوعات المعروضة">
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <KV label="المرحّل" value={topicsPrev} />
          <KV label="الوارد الشهري" value={topicsMonthly} />
          <KV label="المجموع" value={topicsTotal} />
          <KV label="المنجز" value={topicsDone} />
          <KV label="المتبقي" value={topicsRemain} />
        </div>
        {topicsNotes && <div className="mb-3 text-sm text-neutral-700"><span className="text-neutral-500">ملاحظات: </span>{topicsNotes}</div>}
        <SimpleTable
          columns={[
            { key: 'number',     title: 'رقم الموضوع' },
            { key: 'summary',    title: 'ملخص الموضوع' },
            { key: 'assignDate', title: 'تاريخ التكليف' },
            { key: 'actionDate', title: 'تاريخ التصرف' },
            { key: 'actionType', title: 'نوع التصرف' },
          ]}
          rows={topics}
          getKey={(r, i) => `${r.number || ''}-${i}`}
        />
      </SectionCard>

      <SectionCard title="الموضوعات المتبقية + الأسباب">
        <SimpleTable
          columns={[
            { key: 'number',     title: 'رقم' },
            { key: 'summary',    title: 'ملخص' },
            { key: 'assignDate', title: 'تاريخ التكليف' },
            { key: 'actionType', title: 'نوع التصرف' },
          ]}
          rows={remainingTopics}
          getKey={(r, i) => `${r.number || ''}-${i}`}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-black/10 bg-white/80 p-3 text-sm">
            <div className="mb-1 text-neutral-500">أسباب ومبررات عدم الإنجاز</div>
            <div className="text-neutral-800 whitespace-pre-wrap">{reasonsJustifications || '—'}</div>
          </div>
          <div className="rounded-lg border border-black/10 bg-white/80 p-3 text-sm">
            <div className="mb-1 text-neutral-500">المشاكل والصعوبات</div>
            <div className="text-neutral-800 whitespace-pre-wrap">{challengesDifficulties || '—'}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* بيانات تجريبية */
function sampleSurveyFor(base = {}) {
  const today = new Date().toISOString().slice(0,10);
  return {
    branch: base.branch || 'طرابلس',
    fullName: base.employeeName || '—',
    cycle: base.cycle || '2025-08',
    role: 'موظف فني',
    department: base.department || 'إدارة الرقابة على قطاعات الموارد الاقتصادية والطاقة',
    degree: 'بكالوريوس',
    major: 'محاسبة',
    prev: 2, monthly: 3, total: 5, done: 4, remain: 1,
    notes: 'لا توجد ملاحظات تذكر.',
    tasks: [
      { subject: 'مراجعة لجنة توريد معدات', durationDays: 5, assignDate: today, doneDate: today, remark: 'حسب الجدول' },
      { subject: 'تفتيش لجنة مشاريع بلدية', durationDays: 3, assignDate: today, doneDate: '', remark: 'جارٍ' },
    ],
    topicsPrev: 1, topicsMonthly: 4, topicsTotal: 5, topicsDone: 3, topicsRemain: 2,
    topicsNotes: 'ينبّه إلى تأخر ردّ جهة الإحالة.',
    topics: [
      { number: 'م-12', summary: 'مذكرة عقود خدمات', assignDate: today, actionDate: today, actionType: 'إحالة' },
      { number: 'م-13', summary: 'ملف متابعة توريد', assignDate: today, actionDate: '', actionType: 'متابعة' },
    ],
    remainingTopics: [
      { number: 'م-14', summary: 'موضوع أرشيف قديم', assignDate: today, actionType: 'متابعة' },
    ],
    reasonsJustifications: 'نقص مستندات من الجهة.',
    challengesDifficulties: 'ضغط عمل + تعارض مواعيد اللجان.',
  };
}

/* عناصر مساعدة لفلترة جداول الإحصائية */
function TableFilterControls({ onQueryChange, sortKey, onSortKeyChange }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5">
        <Search size={16} className="opacity-60" />
        <input
          placeholder="بحث باسم الموظف…"
          className="w-64 bg-transparent text-sm outline-none"
          onChange={(e)=>onQueryChange(e.target.value)}
        />
      </div>
      <div className="relative">
        <select
          value={sortKey}
          onChange={(e)=>onSortKeyChange(e.target.value)}
          className="appearance-none rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 pr-8 text-sm outline-none hover:bg-white"
        >
          <option value="employee">الفرز: اسم الموظف</option>
          <option value="total">الفرز: المجموع</option>
          <option value="done">الفرز: المنجز</option>
          <option value="remain">الفرز: المتبقي</option>
        </select>
        <ChevronDown className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 opacity-60" size={16} />
      </div>
    </div>
  );
}
function StatsTable({ rows, totals, onView }) {
  const hasView = typeof onView === 'function';
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white/60">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white/70 backdrop-blur">
            <tr className="border-b border-black/10">
              <th className="p-3 text-right">ر/م</th>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">الموضوعات المرحلة</th>
              <th className="p-3 text-right">الوارد الشهري</th>
              <th className="p-3 text-right">المجموع</th>
              <th className="p-3 text-right">المنجز</th>
              <th className="p-3 text-right">المتبقي</th>
              <th className="p-3 text-right">ملاحظات (قادة)</th>
              {hasView && <th className="p-3 text-right">عرض</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={hasView ? 9 : 8}>
                  <EmptyState title="لا توجد بيانات" subtitle="لن تظهر صفوف إلا بعد إحالة استبيانات." />
                </td>
              </tr>
            ) : rows.map((r, idx) => (
              <tr key={`${idx}-${r.employee}`} className={twMerge('border-t border-black/5', idx%2===0 ? 'bg-white/60' : 'bg-white/40')}>
                <td className="p-3 text-center">{idx+1}</td>
                <td className="p-3">{r.employee}</td>
                <td className="p-3">{r.prev}</td>
                <td className="p-3">{r.monthly}</td>
                <td className="p-3">{r.total}</td>
                <td className="p-3">{r.done}</td>
                <td className="p-3">{r.remain}</td>
                <td className="p-3">
                  <div className="flex flex-col gap-1">
                    {r.managerNote && <span className="rounded-md bg-[#FFF4CC] px-1 py-0.5 text-[11px] text-[#6B5200]" title="ملاحظة مدير الإدارة">{r.managerNote}</span>}
                    {r.branchManagerNote && <span className="rounded-md bg-[#E7F8EA] px-1 py-0.5 text-[11px] text-[#205B25]" title="ملاحظة مدير الفرع">{r.branchManagerNote}</span>}
                    {!r.managerNote && !r.branchManagerNote && <span className="text-xs text-neutral-500">—</span>}
                  </div>
                </td>
                {hasView && (
                  <td className="p-3">
                    <ActionButton icon={Eye} onClick={()=>onView(r)}>عرض</ActionButton>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-black/10 bg-aca-gold/10 font-semibold">
                <td className="p-3 text-right" colSpan={2}>الإجمالي</td>
                <td className="p-3">{totals.prev}</td>
                <td className="p-3">{totals.monthly}</td>
                <td className="p-3">{totals.total}</td>
                <td className="p-3">{totals.done}</td>
                <td className="p-3">{totals.remain}</td>
                <td className="p-3"></td>
                {hasView && <td className="p-3"></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

/* ======================= (1) وارد مدير الفرع — Tabs لكل إدارة ======================= */
function BranchManagerInbox({ queue = [], setQueue = () => {}, activeDepartment }) {
  const data = Array.isArray(queue) ? queue : [];

  const [tab, setTab] = useState('awaiting'); // awaiting | returned_to_manager | sent | returned_from_unit | sent_to_inspection
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [selected, setSelected] = useState(null);
  const [returnNote, setReturnNote] = useState('');
  const [managerNoteOnce, setManagerNoteOnce] = useState(''); // تُثبت مرة واحدة عند أول اعتماد للوحدة

  const filteredByDept = useMemo(
    () => data.filter(x => (x.department || '') === (activeDepartment || '')),
    [data, activeDepartment]
  );

  const counts = useMemo(() => ({
    awaiting:             filteredByDept.filter(x => x.status === 'awaiting_branch').length,
    returned_to_manager:  filteredByDept.filter(x => x.status === 'returned_to_manager').length,
    sent:                 filteredByDept.filter(x => x.status === 'sent_to_unit').length,
    returned_from_unit:   filteredByDept.filter(x => x.status === 'returned_from_unit').length,
    sent_to_inspection:   filteredByDept.filter(x => x.status === 'sent_to_inspection').length,
  }), [filteredByDept]);

  const filteredQueue = useMemo(() => {
    const q = (query || '').trim();
    const byTab = (x) =>
      tab === 'awaiting'            ? x.status === 'awaiting_branch' :
      tab === 'returned_to_manager' ? x.status === 'returned_to_manager' :
      tab === 'sent'                ? x.status === 'sent_to_unit' :
      tab === 'returned_from_unit'  ? x.status === 'returned_from_unit' :
                                      x.status === 'sent_to_inspection';

    const base = filteredByDept
      .filter(byTab)
      .filter(x => !q || [x.employeeName, x.department, x.cycle].some(f => (f || '').includes(q)));

    const sorted = [...base].sort((a,b) => {
      if (sort === 'employee') return (a.employeeName || '').localeCompare(b.employeeName || '', 'ar');
      if (sort === 'cycle')    return (a.cycle || '').localeCompare(b.cycle || '');
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });
    return sorted;
  }, [filteredByDept, tab, query, sort]);

  const setStatusLocal = (id, status, note = '', extra = {}) => {
    setQueue(prev => (Array.isArray(prev) ? prev : data).map(x =>
      x.id === id ? { ...x, status, lastAction: { by: 'branch_manager', at: new Date().toISOString(), note }, ...extra } : x
    ));
  };

  const openDetails  = (item) => { setSelected(item); setReturnNote(''); setManagerNoteOnce(''); };
  const closeDetails = () => setSelected(null);

  const returnToDirectorateManager = (id, note) => {
    const reason = (note || '').trim();
    if (!reason) {
      toast.error('يرجى كتابة سبب واضح قبل الإرجاع');
      document.getElementById('return-note-branch')?.focus();
      return;
    }
    setStatusLocal(id, 'returned_to_manager', reason);
    toast.warning(`تم إرجاع الاستبيان #${id} لمدير الإدارة — السبب: ${reason}`);
    if (selected?.id === id) closeDetails();
  };

  // يثبّت ملاحظة مدير الفرع مرة واحدة فقط عند أول إحالة للوحدة
  const sendToUnit = (id, note = '') => {
    const list = Array.isArray(queue) ? queue : [];
    const current = list.find(x => x.id === id) || selected || {};
    const firstApproval = !current.branchManagerNote;
    const entered = (note || '').trim();
    const savedNote = firstApproval ? entered : (current.branchManagerNote || '');

    setStatusLocal(
      id,
      'sent_to_unit',
      firstApproval ? (savedNote || 'أُرسل للوحدة.') : 'أُعيد الإرسال للوحدة.',
      { branchManagerNote: savedNote }
    );

    toast.success(
      `تم ${firstApproval ? 'إرسال' : 'إعادة إرسال'} الاستبيان #${id} للوحدة${savedNote ? ' — ملاحظة المدير مُثبتة' : ''}`
    );
    if (selected?.id === id) closeDetails();
  };

  // إحالة للتفتيش — يرسل دائمًا ملاحظة مدير الإدارة + مدير الفرع (إن وُجدت)
  const sendToInspection = (id) => {
    const list = Array.isArray(queue) ? queue : [];
    const current = list.find(x => x.id === id) || selected || {};
    const combinedNote = [current.managerNote, current.branchManagerNote].filter(Boolean).join(' | ');
    setStatusLocal(
      id,
      'sent_to_inspection',
      combinedNote || 'تمت الإحالة إلى مكتب التفتيش.',
      { inspectionNote: combinedNote }
    );
    toast.success(`تم إحالة الاستبيان #${id} إلى التفتيش${combinedNote ? ' مع الملاحظات' : ''}`);
    if (selected?.id === id) closeDetails();
  };

  return (
    <section className="mb-8">
      <SectionHeader
        icon={Inbox}
        title={`وارد مدير الفرع — ${activeDepartment || 'اختر إدارة من التبويبات أعلاه'}`}
        hint="واجهة واضحة تُظهر ملاحظات القيادة كجزء مكمل للاستبيان في كل مرحلة."
      />

      {/* فلاتر */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[auto,1fr,auto] md:items-center">
        <div className="flex flex-wrap gap-2">
          <TabBtn active={tab==='awaiting'} onClick={()=>setTab('awaiting')} color="bg-yellow-400" text="بانتظار الاعتماد" count={counts.awaiting}/>
          <TabBtn active={tab==='returned_to_manager'} onClick={()=>setTab('returned_to_manager')} color="bg-red-500" text="المُرجعة لمدير الإدارة" count={counts.returned_to_manager}/>
          <TabBtn active={tab==='sent'} onClick={()=>setTab('sent')} color="bg-blue-500" text="المُحالة للوحدة" count={counts.sent}/>
          <TabBtn active={tab==='returned_from_unit'} onClick={()=>setTab('returned_from_unit')} color="bg-emerald-500" text="المعادة من الوحدة" count={counts.returned_from_unit}/>
          <TabBtn active={tab==='sent_to_inspection'} onClick={()=>setTab('sent_to_inspection')} color="bg-purple-500" text="أُحيل للتفتيش" count={counts.sent_to_inspection}/>
        </div>

        <div className="flex items-center justify-start md:justify-center">
          <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5">
            <Search size={16} className="opacity-60" />
            <input
              placeholder="بحث باسم الموظف/الشهر…"
              className="w-72 bg-transparent text-sm outline-none"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-start gap-2 md:justify-end">
          <span className="text-xs text-neutral-600">ترتيب حسب:</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e)=>setSort(e.target.value)}
              className="appearance-none rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 pr-8 text-sm outline-none hover:bg-white"
            >
              <option value="recent">الأحدث</option>
              <option value="employee">اسم الموظف</option>
              <option value="cycle">الشهر</option>
            </select>
            <ChevronDown className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 opacity-60" size={16} />
          </div>
        </div>
      </div>

      {/* الجدول */}
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/70">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/70 backdrop-blur">
              <tr className="border-b border-black/10">
                <th className="p-3 text-right">الموظف</th>
                <th className="p-3 text-right">الإدارة</th>
                <th className="p-3 text-right">الشهر</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">موضوعات (م/مـ/ب)</th>
                <th className="p-3 text-right">استلمت</th>
                <th className="p-3 text-right">ملاحظات القيادة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8}><EmptyState title="لا توجد عناصر" subtitle="غيّر التبويب أو ابحث بكلمة أخرى." /></td>
                </tr>
              ) : filteredQueue.map((row, idx) => (
                <tr key={row.id} className={twMerge('border-t border-black/5 transition-colors', idx%2===0?'bg-white/60':'bg-white/40', 'hover:bg-aca-gold/10')}>
                  <td className="p-3 whitespace-nowrap">{row.employeeName}</td>
                  <td className="p-3 min-w-[260px]">{row.department}</td>
                  <td className="p-3">{row.cycle}</td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <StatusBadge status={row.status} />
                      {row.lastAction?.note && (
                        <div className="text-xs text-neutral-600 line-clamp-1" title={row.lastAction.note}>
                          {row.lastAction.note}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="inline-flex items-center gap-2">
                      <span className="rounded-md bg-black/5 px-1.5 py-0.5">{row.topics.total}</span>
                      <span className="text-xs text-neutral-600">/</span>
                      <span className="rounded-md bg-black/5 px-1.5 py-0.5">{row.topics.done}</span>
                      <span className="text-xs text-neutral-600">/</span>
                      <span className="rounded-md bg-black/5 px-1.5 py-0.5">{row.topics.remain}</span>
                    </div>
                  </td>
                  <td className="p-3 text-neutral-600 whitespace-nowrap">
                    <span suppressHydrationWarning>{formatUtc(row.submittedAt)}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1 max-w-[340px]">
                      {row.managerNote && (
                        <span className="truncate rounded-md bg-[#FFF4CC] px-1.5 py-0.5 text-[11px] text-[#6B5200]" title={`مدير الإدارة: ${row.managerNote}`}>
                          مدير الإدارة: {row.managerNote}
                        </span>
                      )}
                      {row.branchManagerNote && (
                        <span className="truncate rounded-md bg-[#E7F8EA] px-1.5 py-0.5 text-[11px] text-[#205B25]" title={`مدير الفرع: ${row.branchManagerNote}`}>
                          مدير الفرع: {row.branchManagerNote}
                        </span>
                      )}
                      {!row.managerNote && !row.branchManagerNote && <span className="text-xs text-neutral-500">—</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <ActionButton icon={Eye} onClick={()=>openDetails(row)}>عرض</ActionButton>

                      {row.status==='awaiting_branch' && (
                        <>
                          <ActionButton variant="warn" icon={Undo2} onClick={()=>{
                            openDetails(row);
                            setTimeout(()=>document.getElementById('return-note-branch')?.focus(),0);
                          }}>إرجاع لمدير الإدارة</ActionButton>

                          <ActionButton variant="success" icon={Archive} onClick={()=>openDetails(row)}>
                            إحالة للوحدة
                          </ActionButton>
                        </>
                      )}

                      {row.status==='returned_from_unit' && (
                        <>
                          <ActionButton variant="success" icon={Archive} onClick={()=>openDetails(row)}>
                            إعادة الإرسال للوحدة
                          </ActionButton>
                          <ActionButton variant="success" icon={Archive} onClick={()=>sendToInspection(row.id)}>
                            إحالة للتفتيش
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال التفاصيل */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title={`تفاصيل الاستبيان — ${selected?.employeeName || ''}`}>
        {selected && (
          <div className="space-y-6 text-sm">
            {/* شريط أعلى يعرض الحالة والوقت ومقتطف ملاحظات القيادة */}
            <SectionCard title="">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <div className="text-neutral-500">الشهر: <span className="font-medium text-aca-gray">{selected.cycle}</span></div>
                  <div className="text-neutral-500">استلمت: <span className="font-medium text-aca-gray" suppressHydrationWarning>{formatUtc(selected.submittedAt)}</span></div>
                </div>
                <div className="flex flex-col gap-1 max-w-[420px]">
                  {selected.managerNote && <span className="truncate rounded bg-[#FFF4CC] px-2 py-1 text-[11px] text-[#6B5200]">مدير الإدارة: {selected.managerNote}</span>}
                  {selected.branchManagerNote && <span className="truncate rounded bg-[#E7F8EA] px-2 py-1 text-[11px] text-[#205B25]">مدير الفرع: {selected.branchManagerNote}</span>}
                </div>
              </div>
            </SectionCard>

            {/* الاستبيان + تكملة (ملاحظات القيادة) */}
            <SurveyPreview
              survey={selected.survey}
              managerNote={selected.managerNote}
              branchManagerNote={selected.branchManagerNote}
            />

            {/* حالة بانتظار الاعتماد */}
            {selected.status === 'awaiting_branch' && (
              <div className="rounded-lg border border-black/10 bg-white/70 p-4 space-y-3">
                {/* إرجاع لمدير الإدارة */}
                <div>
                  <label className="mb-1 block text-sm text-neutral-600">
                    سبب الإرجاع (إلزامي عند الإرجاع لمدير الإدارة)
                  </label>
                  <textarea
                    id="return-note-branch"
                    rows={3}
                    value={returnNote}
                    onChange={(e)=>setReturnNote(e.target.value)}
                    className="min-h-[84px] w-full rounded-lg border border-neutral-200 bg-white/85 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-aca-gold"
                    placeholder="مثال: يُرجى تدقيق أرقام الوارد الشهري…"
                  />
                  <div className="mt-2">
                    <ActionButton variant="warn" icon={Undo2}
                      onClick={()=>returnToDirectorateManager(selected.id, returnNote)}>
                      إرجاع لمدير الإدارة
                    </ActionButton>
                  </div>
                </div>

                {/* إحالة للوحدة — يثبت ملاحظة مدير الفرع أول مرة فقط */}
                <div className="pt-2 border-t border-neutral-200">
                  {!selected.branchManagerNote ? (
                    <>
                      <label className="mb-1 block text-sm text-neutral-600">
                        ملاحظة مدير الفرع (تُثبت عند أول اعتماد فقط وتظهر لاحقًا في كل المراحل)
                      </label>
                      <textarea
                        rows={3}
                        value={managerNoteOnce}
                        onChange={(e)=>setManagerNoteOnce(e.target.value)}
                        className="min-h-[84px] w-full rounded-lg border border-neutral-200 bg-white/85 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-aca-gold"
                        placeholder="أكتب ملاحظة تُرفق تلقائياً مع الاستبيان في جميع المراحل التالية…"
                      />
                      <div className="mt-2">
                        <ActionButton variant="success" icon={Archive}
                          onClick={()=>sendToUnit(selected.id, managerNoteOnce)}>
                          إحالة للوحدة
                        </ActionButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                        <span className="font-medium">ملاحظة مدير الفرع المثبتة:</span> {selected.branchManagerNote}
                      </div>
                      <div className="mt-2">
                        <ActionButton variant="success" icon={Archive}
                          onClick={()=>sendToUnit(selected.id)}>
                          إحالة للوحدة
                        </ActionButton>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* حالة المعادة من الوحدة */}
            {selected.status === 'returned_from_unit' && (
              <div className="rounded-lg border border-black/10 bg-white/70 p-4 space-y-2">
                <div className="text-sm text-neutral-600">
                  الاستبيان عاد من الوحدة — يمكنك إعادة الإرسال، أو إحالته للتفتيش. (ستظهر ملاحظتا مدير الإدارة والفرع مع الإحالة)
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton variant="success" icon={Archive} onClick={()=>sendToUnit(selected.id)}>
                    إعادة الإرسال للوحدة
                  </ActionButton>
                  <ActionButton variant="success" icon={Archive} onClick={()=>sendToInspection(selected.id)}>
                    إحالة للتفتيش
                  </ActionButton>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}

function TabBtn({ active, onClick, color, text, count }) {
  return (
    <button
      className={twMerge(
        'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm border',
        active ? 'border-aca-gold bg-aca-gold/15' : 'border-black/10 bg-white/70 hover:bg-white'
      )}
      onClick={onClick}
    >
      <Dot color={color} /> {text}
      <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px]">{count}</span>
    </button>
  );
}

/* ============ (2) الإحصائية الشهرية — (للتاب النشط فقط) ============ */
function BranchMonthlyStats({ queue = [], activeDepartment }) {
  const safeQueue = Array.isArray(queue) ? queue : [];
  const [cycle, setCycle] = useState('2025-08');

  const rows = useMemo(() => {
    const data = safeQueue.filter(x => (x.department || '') === (activeDepartment || ''));
    const picked = data.filter(x =>
      ['sent_to_unit','awaiting_branch','returned_from_unit','returned_to_manager','sent_to_inspection'].includes(x.status)
    );
    return picked.map((x) => {
      const s = x.survey || {};
      const prev    = Number(s.topicsPrev    ?? 0);
      const monthly = Number(s.topicsMonthly ?? 0);
      const total   = prev + monthly;
      const done    = Number(s.topicsDone    ?? 0);
      const remain  = Math.max(total - done, 0);
      return {
        employee: x.employeeName || s.fullName || '—',
        prev, monthly, total, done, remain,
        managerNote: x.managerNote || '',
        branchManagerNote: x.branchManagerNote || '',
        cycle: x.cycle || s.cycle || '',
        sourceId: x.id,
        survey: s,
        source: x,
      };
    });
  }, [safeQueue, activeDepartment]);

  const totals = useMemo(() => rows.reduce((acc, r) => ({
    prev: acc.prev + r.prev,
    monthly: acc.monthly + r.monthly,
    total: acc.total + r.total,
    done: acc.done + r.done,
    remain: acc.remain + r.remain,
  }), { prev:0, monthly:0, total:0, done:0, remain:0 }), [rows]);

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('employee');

  const filtered = useMemo(() => {
    const q = (query || '').trim();
    const base = rows.filter(r =>
      (!q || (r.employee || '').includes(q)) &&
      (!cycle || (r.cycle || '').includes(cycle))
    );
    const sorted = [...base].sort((a, b) => {
      if (sortKey === 'employee') return (a.employee || '').localeCompare(b.employee || '', 'ar');
      if (sortKey === 'total')  return b.total  - a.total;
      if (sortKey === 'done')   return b.done   - a.done;
      if (sortKey === 'remain') return b.remain - a.remain;
      return 0;
    });
    return sorted;
  }, [rows, query, sortKey, cycle]);

  const [selectedRow, setSelectedRow] = useState(null);
  const openPreview = (row) => setSelectedRow(row);
  const closePreview = () => setSelectedRow(null);

  const exportCsv = () => {
    if (filtered.length === 0) { toast.error('لا توجد بيانات لتصديرها.'); return; }
    const header = ['#','الاسم','المرحّل','الوارد','المجموع','المنجز','المتبقي','ملاحظة مدير الإدارة','ملاحظة مدير الفرع'];
    const body = filtered.map((r, i) =>
      [i+1, r.employee, r.prev, r.monthly, r.total, r.done, r.remain,
       (r.managerNote || '').replace(/\n/g,' '),
       (r.branchManagerNote || '').replace(/\n/g,' ')
      ].join(',')
    );
    const csv = [header.join(','), ...body].join('\n');
    const blob = new Blob([new TextEncoder().encode(csv)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `إحصائية-شهرية-${activeDepartment || 'الادارة'}-${cycle}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (filtered.length === 0) { toast.error('لا توجد بيانات لتصديرها.'); return; }
    const esc = (s = '') => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const headerCells = ['#','الاسم','المرحّل','الوارد','المجموع','المنجز','المتبقي','ملاحظة مدير الإدارة','ملاحظة مدير الفرع'];
    const bodyRows = filtered.map((r, idx) => [
      String(idx + 1),
      esc(r.employee || ''),
      String(r.prev ?? 0),
      String(r.monthly ?? 0),
      String(r.total ?? 0),
      String(r.done ?? 0),
      String(r.remain ?? 0),
      esc((r.managerNote || '').replace(/\n/g, ' ')),
      esc((r.branchManagerNote || '').replace(/\n/g, ' ')),
    ]);

    const sums = filtered.reduce((a, r) => {
      a.prev    += Number(r.prev    || 0);
      a.monthly += Number(r.monthly || 0);
      a.total   += Number(r.total   || 0);
      a.done    += Number(r.done    || 0);
      a.remain  += Number(r.remain  || 0);
      return a;
    }, { prev:0, monthly:0, total:0, done:0, remain:0 });

    const html = `
<!doctype html><html lang="ar" dir="rtl"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>الاحصائية الشهرية — ${esc(activeDepartment || '')}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Amiri:wght@700&display=swap');
*{box-sizing:border-box} body{font-family:"Cairo","Amiri",Tahoma,Arial,sans-serif;margin:0;padding:24px;color:#1f2937;background:#fff}
.header{text-align:center;margin-bottom:12px}
.logo{height:64px;width:64px;object-fit:contain;margin:0 auto 8px auto;display:block}
.h1{font-family:"Amiri","Cairo",sans-serif;font-weight:700;font-size:22px;margin:4px 0 0 0}
.sub{font-size:13px;color:#374151;margin-top:2px}
.title{margin-top:10px;font-size:16px;font-weight:700;color:#111827}
.meta{margin-top:4px;font-size:13px;color:#374151}
table{width:100%;border-collapse:collapse;margin-top:14px}
thead th{background:#f3f4f6;color:#111827;font-weight:700;font-size:13px;border:1px solid #e5e7eb;padding:8px 6px;text-align:right}
tbody td{border:1px solid #e5e7eb;padding:8px 6px;font-size:13px;vertical-align:top}
tbody td.col-idx{background:#fafafa;font-weight:700;text-align:center;width:54px}
tfoot td{border:1px solid #e5e7eb;padding:8px 6px;font-weight:700;background:#fffbea}
@media print{body{padding:12mm}}
</style>
</head><body>
  <div class="header">
    <img class="logo" src="${location.origin}/logo.png" alt="شعار الهيئة"/>
    <div class="h1">هيئة الرقابة الإدارية</div>
    <div class="sub">مكتب التفتيش وتقييم الأداء</div>
    <div class="title">الإحصائية الشهرية — ${esc(activeDepartment || '')}</div>
    <div class="meta">عن شهر: ${esc(cycle)}</div>
  </div>
  <table>
    <thead><tr>
      ${headerCells.map((h,i)=>`<th${i===0?' style="background:#e5e7eb"':''}>${h}</th>`).join('')}
    </tr></thead>
    <tbody>
      ${bodyRows.map(cells => `
        <tr>
          <td class="col-idx">${cells[0]}</td>
          <td>${cells[1]}</td>
          <td>${cells[2]}</td>
          <td>${cells[3]}</td>
          <td>${cells[4]}</td>
          <td>${cells[5]}</td>
          <td>${cells[6]}</td>
          <td>${cells[7]}</td>
          <td>${cells[8]}</td>
        </tr>`).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="text-align:right;">الإجمالي</td>
        <td>${sums.prev}</td>
        <td>${sums.monthly}</td>
        <td>${sums.total}</td>
        <td>${sums.done}</td>
        <td>${sums.remain}</td>
        <td></td>
        <td></td>
      </tr>
    </tfoot>
  </table>
<script>
  window.onload = () => { window.print(); setTimeout(()=>{ try{ window.close(); }catch(e){} }, 300); };
</script>
</body></html>`.trim();

    const w = window.open('', '_blank');
    if (!w) { toast.error('رجاءً اسمح بالنوافذ المنبثقة لإتمام التصدير.'); return; }
    w.document.open(); w.document.write(html); w.document.close();
  };

  const cycleLabel = useMemo(() => {
    try {
      const d = new Date(`${cycle}-01T00:00:00Z`);
      return d.toLocaleDateString('ar', { month: 'long', year: 'numeric' });
    } catch { return cycle; }
  }, [cycle]);

  return (
    <section className="mb-8 rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur">
      <SectionHeader
        icon={FileSpreadsheet}
        title={`الإحصائية الشهرية — ${activeDepartment || 'اختَر إدارة'} — ${cycleLabel}`}
        hint="الجدول يعرض ملاحظات القيادة ويتيح عرض الاستبيان كتكملة واضحة."
      />
      <div className="mb-3 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5">
          <span className="text-xs text-neutral-600">الشهر</span>
          <input type="month" className="bg-transparent text-sm outline-none" value={cycle} onChange={(e)=>setCycle(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton variant="success" icon={Download} onClick={exportCsv}>تصدير CSV</ActionButton>
          <ActionButton variant="success" icon={FileSpreadsheet} onClick={exportPdf}>تصدير PDF</ActionButton>
        </div>
      </div>

      <TableFilterControls
        onQueryChange={setQuery}
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
      />

      <StatsTable rows={filtered} totals={totals} onView={openPreview} />

      <Modal
        open={!!selectedRow}
        onClose={closePreview}
        title={selectedRow ? `عرض الاستبيان — ${selectedRow.employee}` : 'عرض الاستبيان'}
      >
        {selectedRow ? (
          <SurveyPreview
            survey={selectedRow.survey}
            managerNote={selectedRow.source?.managerNote}
            branchManagerNote={selectedRow.source?.branchManagerNote}
          />
        ) : null}
      </Modal>
    </section>
  );
}

/* ============ (3) الإحصائية الشهرية للإدارات (تجميع على مستوى كل إدارة) ============ */
/* ============ (3) الإحصائية الشهرية للإدارات (تجميع على مستوى كل إدارة) ============ */
// ==== أضِف هذا الاستيراد أعلى الملف إن لم يكن موجودًا ====

// ======================================================================
// استبدل هذا المكوّن بالكامل بمحتوى لوحة ديموغرافية جميلة
// ======================================================================
function BranchAllDepartmentsStats({ queue = [] }) {
  const safeQueue = Array.isArray(queue) ? queue : [];
  const [cycle, setCycle] = useState('2025-08');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('department');

  // تجميع حسب الإدارة
  const departmentsAgg = useMemo(() => {
    const inCycle = safeQueue.filter(x => !cycle || (x.cycle || '').includes(cycle));
    const map = new Map();
    inCycle.forEach(x => {
      const s = x.survey || {};
      const dep = x.department || s.department || '—';
      const prev    = Number(s.topicsPrev    ?? 0);
      const monthly = Number(s.topicsMonthly ?? 0);
      const total   = prev + monthly;
      const done    = Number(s.topicsDone    ?? 0);
      const remain  = Math.max(total - done, 0);
      const note    = s.topicsNotes || x.branchManagerNote || x.managerNote || x.secretaryNote || x.employeeNote || '';

      if (!map.has(dep)) map.set(dep, { department: dep, prev:0, monthly:0, total:0, done:0, remain:0, notes: [] });
      const agg = map.get(dep);
      agg.prev += prev; agg.monthly += monthly; agg.total += total; agg.done += done; agg.remain += remain;
      if (note) agg.notes.push(note);
    });
    return Array.from(map.values()).map(r => ({ ...r, note: r.notes.join(' | ') }));
  }, [safeQueue, cycle]);

  // فلترة وترتيب
  const filtered = useMemo(() => {
    const q = (query || '').trim();
    const base = departmentsAgg.filter(r => (!q || (r.department || '').includes(q)));
    const sorted = [...base].sort((a,b) => {
      if (sortKey === 'department') return (a.department || '').localeCompare(b.department || '', 'ar');
      if (sortKey === 'total')  return b.total  - a.total;
      if (sortKey === 'done')   return b.done   - a.done;
      if (sortKey === 'remain') return b.remain - a.remain;
      return 0;
    });
    return sorted;
  }, [departmentsAgg, query, sortKey]);

  // إجماليات عامة لبطاقات KPI
  const totals = useMemo(() => filtered.reduce((acc, r) => ({
    prev: acc.prev + r.prev,
    monthly: acc.monthly + r.monthly,
    total: acc.total + r.total,
    done: acc.done + r.done,
    remain: acc.remain + r.remain,
  }), { prev:0, monthly:0, total:0, done:0, remain:0 }), [filtered]);

  const percentDone  = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;
  const percentRem   = totals.total > 0 ? 100 - percentDone : 0;

  // بيانات الرسوم
  const top5 = useMemo(() => {
    const arr = [...filtered].sort((a,b)=> (b.done + b.remain) - (a.done + a.remain)).slice(0, 5);
    return arr.map(r => ({ dep: r.department, done: r.done, remain: r.remain }));
  }, [filtered]);

  const perDeptStack = useMemo(() => {
    return filtered.map(r => ({ dep: r.department, done: r.done, remain: r.remain }));
  }, [filtered]);

  const donutData = useMemo(() => [
    { name: 'منجز', value: totals.done },
    { name: 'متبقي', value: totals.remain },
  ], [totals.done, totals.remain]);

  const COLORS = ['#10b981', '#f59e0b']; // أخضر/متبقي

  const cycleLabel = useMemo(() => {
    try {
      const d = new Date(`${cycle}-01T00:00:00Z`);
      return d.toLocaleDateString('ar', { month: 'long', year: 'numeric' });
    } catch { return cycle; }
  }, [cycle]);

  return (
    <section className="mb-8 rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur">
      <SectionHeader
        icon={FileSpreadsheet}
        title={`الإحصائية الشهرية للإدارات — ${cycleLabel}`}
        hint="لوحة تفاعلية توضح أداء الإدارات (منجز/متبقي) بشكل ديموغرافي."
      />

      {/* شريط أدوات */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5">
          <span className="text-xs text-neutral-600">الشهر</span>
          <input type="month" className="bg-transparent text-sm outline-none" value={cycle} onChange={(e)=>setCycle(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5">
            <Search size={16} className="opacity-60" />
            <input
              placeholder="بحث باسم الإدارة…"
              className="w-64 bg-transparent text-sm outline-none"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              value={sortKey}
              onChange={(e)=>setSortKey(e.target.value)}
              className="appearance-none rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 pr-8 text-sm outline-none hover:bg-white"
            >
              <option value="department">الفرز: الإدارة</option>
              <option value="total">الفرز: المجموع</option>
              <option value="done">الفرز: المنجز</option>
              <option value="remain">الفرز: المتبقي</option>
            </select>
            <ChevronDown className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 opacity-60" size={16} />
          </div>
        </div>
      </div>

      {/* بطاقات KPI */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-black/10 bg-white/60 p-4">
          <div className="text-xs text-neutral-600">إجمالي الموضوعات</div>
          <div className="mt-1 text-2xl font-semibold text-aca-gray">{totals.total}</div>
          <div className="mt-2 text-xs text-neutral-500">مرحّل + وارد شهري</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/60 p-4">
          <div className="text-xs text-neutral-600">المنجز</div>
          <div className="mt-1 text-2xl font-semibold text-aca-gray">{totals.done}</div>
          <div className="mt-2 h-2 w-full rounded-full bg-black/10">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percentDone}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/60 p-4">
          <div className="text-xs text-neutral-600">المتبقي</div>
          <div className="mt-1 text-2xl font-semibold text-aca-gray">{totals.remain}</div>
          <div className="mt-2 h-2 w-full rounded-full bg-black/10">
            <div className="h-2 rounded-full bg-amber-500" style={{ width: `${percentRem}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/60 p-4">
          <div className="text-xs text-neutral-600">نسبة الإنجاز</div>
          <div className="mt-1 text-2xl font-semibold text-aca-gray">{percentDone}%</div>
          <div className="mt-1 text-xs text-neutral-500">من إجمالي الموضوعات</div>
        </div>
      </div>

      {/* شبكة الرسوم: أعمدة مكدّسة (Top 5) + دونات إجمالي + شريطي أفقي لكل إدارة */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* أعمدة مكدّسة لأفضل 5 إدارات */}
        <div className="h-[340px] rounded-xl border border-black/10 bg-white/60 p-3">
          {Array.isArray(top5) && top5.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top5} barCategoryGap={18}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dep" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="done"   name="منجز"  stackId="st" fill="#10b981" />
                <Bar dataKey="remain" name="متبقي" stackId="st" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">
              لا توجد بيانات كافية لعرض أفضل 5 إدارات
            </div>
          )}
        </div>

        {/* دونات إجمالي منجز/متبقي */}
        <div className="h-[340px] rounded-xl border border-black/10 bg-white/60 p-3">
          {(donutData[0].value + donutData[1].value) > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">
              لا توجد بيانات لعرض النِسب
            </div>
          )}
        </div>
      </div>

      {/* شريط أفقي لكل إدارة */}
      <div className="mt-4 h-[420px] rounded-xl border border-black/10 bg-white/60 p-3">
        {Array.isArray(perDeptStack) && perDeptStack.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={perDeptStack}
              layout="vertical"
              barCategoryGap={10}
              margin={{ left: 30, right: 20, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="dep" width={220} />
              <Tooltip />
              <Legend />
              <Bar dataKey="done"   name="منجز"  stackId="v" fill="#10b981" />
              <Bar dataKey="remain" name="متبقي" stackId="v" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            لا توجد إدارات لعرضها
          </div>
        )}
      </div>

      {/* جدول مختصر تحت الرسوم (يبقى كما تحب — اختياري) */}
      <div className="mt-5 overflow-hidden rounded-xl border border-black/10 bg-white/60">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/70 backdrop-blur">
              <tr className="border-b border-black/10">
                <th className="p-3 text-right">#</th>
                <th className="p-3 text-right">الإدارة</th>
                <th className="p-3 text-right">الموضوعات المرحلة</th>
                <th className="p-3 text-right">الوارد الشهري</th>
                <th className="p-3 text-right">المجموع</th>
                <th className="p-3 text-right">المنجز</th>
                <th className="p-3 text-right">المتبقي</th>
                <th className="p-3 text-right">ملاحظات مختصرة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}><EmptyState title="لا توجد بيانات" subtitle="أضف/أحِل استبيانات أو غيّر الشهر." /></td>
                </tr>
              ) : filtered.map((r, idx) => (
                <tr key={`${idx}-${r.department}`} className={twMerge('border-t border-black/5', idx%2===0 ? 'bg-white/60' : 'bg-white/40')}>
                  <td className="p-3 text-center">{idx+1}</td>
                  <td className="p-3">{r.department}</td>
                  <td className="p-3">{r.prev}</td>
                  <td className="p-3">{r.monthly}</td>
                  <td className="p-3">{r.total}</td>
                  <td className="p-3">{r.done}</td>
                  <td className="p-3">{r.remain}</td>
                  <td className="p-3">{r.note}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-black/10 bg-aca-gold/10 font-semibold">
                  <td className="p-3 text-right" colSpan={2}>الإجمالي</td>
                  <td className="p-3">{totals.prev}</td>
                  <td className="p-3">{totals.monthly}</td>
                  <td className="p-3">{totals.total}</td>
                  <td className="p-3">{totals.done}</td>
                  <td className="p-3">{totals.remain}</td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </section>
  );
}



/* ============================== صفحة مدير الفرع (Tabs) ============================== */
export default function BranchManagerPage() {
  const [lang, setLang] = useState('ar');

  // بيانات تجريبية مع ملاحظة مدير الإدارة وبعض الحالات
  const [queue, setQueue] = useState(() => ([
    {
      id: 'b1',
      employeeName: 'مروان العابد',
      department: 'إدارة الرقابة على قطاعات الموارد الاقتصادية والطاقة',
      cycle: '2025-08',
      submittedAt: '2025-08-07T08:40:00Z',
      status: 'awaiting_branch',
      topics: { total: 8, done: 6, remain: 2 },
      managerNote: 'ملاحظة مدير الإدارة: تدقيق أرقام الوارد الشهري.',
      secretaryNote: 'تمت المراجعة الأولية.',
      survey: sampleSurveyFor({ employeeName: 'مروان العابد', department: 'إدارة الرقابة على قطاعات الموارد الاقتصادية والطاقة', cycle: '2025-08' }),
    },
    {
      id: 'b2',
      employeeName: 'خلود خليفة',
      department: 'إدارة الرقابة على قطاعات البنية الأساسية',
      cycle: '2025-08',
      submittedAt: '2025-08-06T13:05:00Z',
      status: 'sent_to_unit',
      topics: { total: 6, done: 4, remain: 2 },
      lastAction: { by: 'branch_manager', at: '2025-08-06T14:00:00Z', note: 'تم الإرسال للوحدة.' },
      branchManagerNote: 'يرجى التدقيق في أرقام الوارد.',
      managerNote: 'مرروا على قسم العقود إن لزم.',
      survey: sampleSurveyFor({ employeeName: 'خلود خليفة', department: 'إدارة الرقابة على قطاعات البنية الأساسية', cycle: '2025-08' }),
    },
    {
      id: 'b3',
      employeeName: 'عمر المبروك',
      department: 'إدارة الرقابة على المجالس البلدية والجهات التابعة لها',
      cycle: '2025-08',
      submittedAt: '2025-08-05T15:20:00Z',
      status: 'returned_from_unit',
      topics: { total: 9, done: 9, remain: 0 },
      lastAction: { by: 'unit', at: '2025-08-05T15:30:00Z', note: 'اكتملت المراجعة الفنية، بانتظار قراركم.' },
      secretaryNote: 'بانتظار قرار مدير الفرع.',
      managerNote: 'تابعوا بند المتبقي بدقة.',
      survey: sampleSurveyFor({ employeeName: 'عمر المبروك', department: 'إدارة الرقابة على المجالس البلدية والجهات التابعة لها', cycle: '2025-08' }),
    },
    {
      id: 'b4',
      employeeName: 'ليلى المبروك',
      department: 'إدارة الرقابة على قطاعات الموارد الاقتصادية والطاقة',
      cycle: '2025-08',
      submittedAt: '2025-08-05T11:10:00Z',
      status: 'sent_to_inspection',
      topics: { total: 7, done: 5, remain: 2 },
      lastAction: { by: 'branch_manager', at: '2025-08-05T12:00:00Z', note: 'تمت الإحالة إلى التفتيش.' },
      branchManagerNote: 'اعتمد وفق الملاحظة المثبتة.',
      managerNote: 'أرفقوا الردود الزمنية.',
      inspectionNote: 'أرفقوا الردود الزمنية. | اعتمد وفق الملاحظة المثبتة.',
      survey: sampleSurveyFor({ employeeName: 'ليلى المبروك', department: 'إدارة الرقابة على قطاعات الموارد الاقتصادية والطاقة', cycle: '2025-08' }),
    },
  ]));

  // تبويبات الإدارات + تبويب "الإحصائية الشهرية للإدارات"
  const departments = useMemo(() => {
    const set = new Set(queue.map(x => x.department).filter(Boolean));
    return Array.from(set);
  }, [queue]);

  const STATS_TAB = '__ALL_STATS__';
  const [activeTab, setActiveTab] = useState(() => departments[0] || STATS_TAB);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (activeTab !== STATS_TAB && !departments.includes(activeTab)) {
      setActiveTab(departments[0] || STATS_TAB);
    }
  }, [departments, activeTab]);

  return (
    <div className="relative bg-aca-beige text-aca-gray">
      {/* خلفية */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#F7F2E6,#F4EDDF,#FFFDF8)] bg-[length:200%_200%] animate-[goldSheen_20s_linear_infinite]" />
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-aca-gold/20 blur-3xl" />
        <div className="absolute -bottom-52 -right-52 h-[600px] w-[600px] rounded-full bg-aca-green/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_24px_24px,rgba(0,0,0,0.35)_1.2px,transparent_1.2px)] [background-size:32px_32px]" />
      </div>

      {/* هيدر */}
      <header className="relative z-10 border-b border-black/5 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-md shadow" />
            <div>
              <div className={`${diwani.className} text-2xl bg-gradient-to-r from-[#AD8F2F] via-aca-gold to-[#E9DFA9] bg-clip-text text-transparent [background-size:200%_100%] animate-goldSheen`}>
                هيئة الرقابة الإدارية
              </div>
              <div className="text-xs text-neutral-600">
                وارد الإدارات بنمط واضح + ملاحظات القيادة كتكملة للاستبيان
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="hidden items-center gap-2 text-aca-gray sm:flex">
              <ShieldCheck size={16} className="opacity-80" />
              <span>اتصال آمن</span>
            </div>
            <div className="h-6 w-px bg-black/10" />
            <button
              onClick={() => setLang(v => v === 'ar' ? 'en' : 'ar')}
              className="rounded-md border border-black/10 bg-white/70 px-3 py-1 hover:bg-white"
            >
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
          </div>
        </div>
      </header>

      {/* Tabs الإدارات + تبويب الإحصائية العامة */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-6">
        <div className="flex flex-wrap gap-2">
          {departments.length === 0 ? (
            <span className="text-sm text-neutral-600">لا توجد إدارات</span>
          ) : departments.map(dep => {
            const active = dep === activeTab;
            return (
              <button
                key={dep}
                onClick={()=>setActiveTab(dep)}
                className={twMerge(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm',
                  active
                    ? 'border-aca-gold bg-aca-gold/15 text-aca-gray'
                    : 'border-black/10 bg-white/70 hover:bg-white'
                )}
                title={dep}
              >
                {dep}
              </button>
            );
          })}

          {/* تبويب الإحصائية الشهرية للإدارات */}
          <button
            onClick={()=>setActiveTab(STATS_TAB)}
            className={twMerge(
              'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm',
              activeTab === STATS_TAB
                ? 'border-aca-gold bg-aca-gold/15 text-aca-gray'
                : 'border-black/10 bg-white/70 hover:bg-white'
            )}
            title="الإحصائية الشهرية للإدارات"
          >
            الإحصائية الشهرية للإدارات
          </button>
        </div>
      </div>

      {/* المحتوى */}
      <main className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-4 py-6">
        {activeTab === STATS_TAB ? (
          <BranchAllDepartmentsStats queue={queue} />
        ) : (
          <>
            <BranchManagerInbox queue={queue} setQueue={setQueue} activeDepartment={activeTab} />
            <BranchMonthlyStats  queue={queue} activeDepartment={activeTab} />
          </>
        )}
      </main>

      <Toaster richColors position="top-center" />
    </div>
  );
}
