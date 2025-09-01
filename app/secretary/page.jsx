'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import localFont from 'next/font/local';
import { Toaster, toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShieldCheck, Info, X, Search, ChevronDown, Eye, Undo2, Archive,
  Download, Inbox, FileSpreadsheet, Trash2
} from 'lucide-react';

/* خط الديواني (ضع الخط في public/fonts/Diwani.ttf) */
const diwani = localFont({
  src: '../../public/fonts/Diwani.ttf',
  display: 'swap',
});

/* أدوات UI */
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
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-black/10 bg-white shadow-xl"
            initial={{ scale: .96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: .96, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white px-4 py-3">
              <h3 className="text-base font-semibold text-aca-gray">{title}</h3>
              <button onClick={onClose} aria-label="إغلاق" className="rounded-md border border-black/10 bg-white/80 p-1.5 hover:bg-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

/* شارة الحالة للأمين الإداري */
function StatusBadge({ status, className }) {
  const map = {
    awaiting_secretary:   { label: 'بانتظار المطابقة',       dot: 'bg-yellow-400', text: 'text-yellow-800', bg: 'bg-yellow-50' },
    returned_by_secretary:{ label: 'مُرجعة للعضو/الموظف',    dot: 'bg-red-500',    text: 'text-red-800',    bg: 'bg-red-50' },
    sent_to_manager:      { label: 'محالة لمدير الإدارة',     dot: 'bg-blue-500',   text: 'text-blue-800',   bg: 'bg-blue-50' },
    returned_by_manager:  { label: 'المعادة من مدير الإدارة', dot: 'bg-emerald-500',text: 'text-emerald-900',bg: 'bg-emerald-50' },
  };
  const s = map[status] || map.awaiting_secretary;
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
      <div className="mb-2 font-semibold text-aca-gray">{title}</div>
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

/* ====== معاينة الاستبيان الكاملة داخل المودال ====== */
function SurveyPreview({ survey }) {
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

/* ======================= (1) وارد الأمين الإداري — الاستبيانات ======================= */
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

function SecretaryInbox({ queue = [], setQueue = () => {} }) {
  const data = Array.isArray(queue) ? queue : [];

  const [tab, setTab] = useState('awaiting'); // awaiting | returned_to_emp | sent | returned_from_manager
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [selected, setSelected] = useState(null);
  const [returnNote, setReturnNote] = useState('');

  const counts = useMemo(() => ({
    awaiting:              data.filter(x => x.status === 'awaiting_secretary').length,
    returned_to_emp:       data.filter(x => x.status === 'returned_by_secretary').length,
    sent:                  data.filter(x => x.status === 'sent_to_manager').length,
    returned_from_manager: data.filter(x => x.status === 'returned_by_manager').length,
  }), [data]);

  const filteredQueue = useMemo(() => {
    const q = (query || '').trim();
    const byTab = (x) =>
      tab === 'awaiting'              ? x.status === 'awaiting_secretary' :
      tab === 'returned_to_emp'       ? x.status === 'returned_by_secretary' :
      tab === 'sent'                  ? x.status === 'sent_to_manager' :
                                        x.status === 'returned_by_manager';

    const base = data
      .filter(byTab)
      .filter(x => !q || [x.employeeName, x.department, x.cycle].some(f => (f || '').includes(q)));

    const sorted = [...base].sort((a,b) => {
      if (sort === 'employee') return (a.employeeName || '').localeCompare(b.employeeName || '', 'ar');
      if (sort === 'cycle')    return (a.cycle || '').localeCompare(b.cycle || '');
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });
    return sorted;
  }, [data, tab, query, sort]);

  const setStatusLocal = (id, status, note='') => {
    setQueue(prev => (Array.isArray(prev) ? prev : data).map(x =>
      x.id === id ? { ...x, status, lastAction: { by: 'secretary', at: new Date().toISOString(), note } } : x
    ));
  };

  const openDetails  = (item) => { setSelected(item); setReturnNote(''); };
  const closeDetails = () => setSelected(null);

  const returnToEmployee = (id, note) => {
    const reason = (note || '').trim();
    if (!reason) {
      toast.error('يرجى كتابة سبب واضح قبل الإرجاع');
      document.getElementById('return-note-sec')?.focus();
      return;
    }
    setStatusLocal(id, 'returned_by_secretary', reason);
    toast.warning(`تم إرجاع الاستبيان #${id} للموظف — السبب: ${reason}`);
    if (selected?.id === id) closeDetails();
  };

  const sendToManager = (id) => {
    setStatusLocal(id, 'sent_to_manager', 'أُرسل لمدير الإدارة.');
    toast.success(`تم إرسال الاستبيان #${id} إلى مدير الإدارة`);
    if (selected?.id === id) closeDetails();
  };

  return (
    <section className="mb-8">
      <SectionHeader
        icon={Inbox}
        title="وارد الأمين الإداري "
        
      />

      {/* فلاتر */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[auto,1fr,auto] md:items-center">
        <div className="flex flex-wrap gap-2">
          <button className={twMerge('inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm border',
              tab==='awaiting' ? 'border-aca-gold bg-aca-gold/15' : 'border-black/10 bg-white/70 hover:bg-white')}
            onClick={()=>setTab('awaiting')}
          >
            <Dot color="bg-yellow-400" /> بانتظار المطابقة
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px]">{counts.awaiting}</span>
          </button>
          <button className={twMerge('inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm border',
              tab==='returned_to_emp' ? 'border-aca-gold bg-aca-gold/15' : 'border-black/10 bg-white/70 hover:bg-white')}
            onClick={()=>setTab('returned_to_emp')}
          >
            <Dot color="bg-red-500" /> المُرجعة للعضو/الموظف
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px]">{counts.returned_to_emp}</span>
          </button>
          <button className={twMerge('inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm border',
              tab==='sent' ? 'border-aca-gold bg-aca-gold/15' : 'border-black/10 bg-white/70 hover:bg-white')}
            onClick={()=>setTab('sent')}
          >
            <Dot color="bg-blue-500" /> المحالة لمدير الإدارة
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px]">{counts.sent}</span>
          </button>
          <button className={twMerge('inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm border',
              tab==='returned_from_manager' ? 'border-aca-gold bg-aca-gold/15' : 'border-black/10 bg-white/70 hover:bg-white')}
            onClick={()=>setTab('returned_from_manager')}
          >
            <Dot color="bg-emerald-500" /> المعادة من مدير الإدارة
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px]">{counts.returned_from_manager}</span>
          </button>
        </div>

        <div className="flex items-center justify-start md:justify-center">
          <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5">
            <Search size={16} className="opacity-60" />
            <input
              placeholder="بحث باسم الموظف/الشهر/الإدارة…"
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
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7}><EmptyState title="لا توجد عناصر" subtitle="غيّر التبويب أو ابحث بكلمة أخرى." /></td>
                </tr>
              ) : filteredQueue.map((row, idx) => (
                <tr key={row.id} className={twMerge('border-t border-black/5 transition-colors', idx%2===0?'bg-white/60':'bg-white/40', 'hover:bg-aca-gold/10')}>
                  <td className="p-3 whitespace-nowrap">{row.employeeName}</td>
                  <td className="p-3 min-w-[260px]">{row.department}</td>
                  <td className="p-3">{row.cycle}</td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <StatusBadge status={row.status} />
                      {row.lastAction?.note && (row.status==='returned_by_secretary' || row.status==='returned_by_manager') && (
                        <div className="text-xs text-red-700/90 line-clamp-1" title={row.lastAction.note}>
                          سبب الإرجاع: {row.lastAction.note}
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
                    <div className="flex flex-wrap gap-2">
                      <ActionButton icon={Eye} onClick={()=>openDetails(row)}>عرض</ActionButton>

                      {row.status==='awaiting_secretary' && (
                        <>
                          <ActionButton variant="warn" icon={Undo2} onClick={()=>{
                            openDetails(row);
                            setTimeout(()=>document.getElementById('return-note-sec')?.focus(),0);
                          }}>إرجاع للموظف</ActionButton>
                          <ActionButton variant="success" icon={Archive} onClick={()=>sendToManager(row.id)}>إرسال لمدير الإدارة</ActionButton>
                        </>
                      )}

                      {row.status==='returned_by_manager' && (
                        <ActionButton variant="success" icon={Archive} onClick={()=>sendToManager(row.id)}>
                          إعادة الإرسال لمدير الإدارة
                        </ActionButton>
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <span className="text-neutral-500">الشهر:</span> <span className="font-medium">{selected.cycle}</span>
                <span className="text-neutral-500 ms-3">استلمت:</span> <span className="font-medium" suppressHydrationWarning>{formatUtc(selected.submittedAt)}</span>
              </div>
              <div className="text-neutral-600 line-clamp-1" title={selected.employeeNote || ''}>
                <span className="text-neutral-500">ملاحظة الموظف:</span> {selected.employeeNote || '—'}
              </div>
            </div>

            {/* معاينة كاملة */}
            <SurveyPreview survey={selected.survey} />

            {selected.status === 'awaiting_secretary' && (
              <div className="rounded-lg border border-black/10 bg-white/70 p-4">
                <label className="mb-1 block text-sm text-neutral-600">سبب الإرجاع (إلزامي عند الإرجاع)</label>
                <textarea
                  id="return-note-sec"
                  rows={3}
                  value={returnNote}
                  onChange={(e)=>setReturnNote(e.target.value)}
                  className="min-h-[84px] w-full rounded-lg border border-neutral-200 bg-white/85 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-aca-gold"
                  placeholder="مثال: يُرجى توضيح الوارد الشهري أو تدقيق الملخص…"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <ActionButton variant="warn" icon={Undo2} onClick={()=>returnToEmployee(selected.id, returnNote)}>إرجاع للموظف</ActionButton>
                  <ActionButton variant="success" icon={Archive} onClick={()=>sendToManager(selected.id)}>إرسال لمدير الإدارة</ActionButton>
                </div>
              </div>
            )}

            {selected.status === 'returned_by_manager' && (
              <div className="rounded-lg border border-black/10 bg-white/70 p-4">
                <div className="mb-1 text-sm text-neutral-600">الاستبيان عاد من مدير الإدارة — عدّل ثم أعد الإرسال.</div>
                <ActionButton variant="success" icon={Archive} onClick={()=>sendToManager(selected.id)}>إعادة الإرسال لمدير الإدارة</ActionButton>
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}

/* ============ (2) الاحصائية التجميعية الشهرية — تتولد تلقائيًا من sent_to_manager ============ */
function SecretaryMonthlyStats({ queue = [] }) {
  const safeQueue = Array.isArray(queue) ? queue : [];

  const [cycle, setCycle] = useState('2025-08');
  const [departmentName, setDepartmentName] = useState('إدارة الرقابة على قطاعات الموارد الاقتصادية والطاقة');

  // صفوف مُولّدة تلقائيًا من العناصر المُرسلة لمدير الإدارة
  const rows = useMemo(() => {
    const sent = safeQueue.filter(x => x.status === 'sent_to_manager');
    return sent.map((x) => {
      const s = x.survey || {};
      const prev    = Number(s.topicsPrev    ?? 0);
      const monthly = Number(s.topicsMonthly ?? 0);
      const total   = prev + monthly;
      const done    = Number(s.topicsDone    ?? 0);
      const remain  = Math.max(total - done, 0);
      return {
        employee: x.employeeName || s.fullName || '—',
        prev, monthly, total, done, remain,
        note: s.topicsNotes || x.employeeNote || '',
        department: x.department || s.department || '',
        cycle: x.cycle || s.cycle || '',
      };
    });
  }, [safeQueue]);

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
      (!departmentName || (r.department || '').includes(departmentName)) &&
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
  }, [rows, query, sortKey, departmentName, cycle]);

  const exportCsv = () => {
    if (filtered.length === 0) { toast.error('لا توجد بيانات لتصديرها.'); return; }
    const header = ['الرقم','الاسم','الموضوعات المرحلة','الوارد الشهري','المجموع','المنجز','المتبقي','ملاحظات'];
    const body = filtered.map((r, i) =>
      [i+1, r.employee, r.prev, r.monthly, r.total, r.done, r.remain, (r.note || '').replace(/\n/g,' ')].join(',')
    );
    const csv = [header.join(','), ...body].join('\n');
    const blob = new Blob([new TextEncoder().encode(csv)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `الاحصائية-التجميعية-${departmentName}-${cycle}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ضع هذه الدالة داخل مكوّن SecretaryMonthlyStats بدلاً من النسخة السابقة
const exportPdf = () => {
  if (filtered.length === 0) { toast.error('لا توجد بيانات لتصديرها.'); return; }

  // تعقيم نصي بسيط للحقول النصية
  const esc = (s = '') => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const headerCells = [
    'الرقم','الاسم','الموضوعات المرحلة','الوارد الشهري','المجموع','المنجز','المتبقي','ملاحظات'
  ];

  const bodyRows = filtered.map((r, idx) => [
    String(idx + 1),
    esc(r.employee || ''),
    String(r.prev ?? 0),
    String(r.monthly ?? 0),
    String(r.total ?? 0),
    String(r.done ?? 0),
    String(r.remain ?? 0),
    esc((r.note || '').replace(/\n/g, ' ')),
  ]);

  // احسب المجاميع من filtered مباشرة
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
<title>الاحصائية التجميعية الشهرية</title>
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
    <div class="title">الاحصائية التجميعية الشهرية لإدارة الرقابة على ${esc(departmentName)}</div>
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
      </tr>
    </tfoot>
  </table>
<script>
  // اطبع تلقائيًا ثم أغلق النافذة (قد تمنع بعض المتصفحات الإغلاق التلقائي)
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
        title={`الاحصائية التجميعية الشهرية لإدارة الرقابة على ${departmentName}   عن شهر ${cycleLabel}  ميلادية`}
      />

      {/* الشريط العلوي */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <div className="text-sm text-neutral-600">الإدارة</div>
          <input
            type="text"
            className="w-80 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 text-sm outline-none"
            value={departmentName}
            onChange={(e)=>setDepartmentName(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5">
            <span className="text-xs text-neutral-600">الشهر</span>
            <input type="month" className="bg-transparent text-sm outline-none" value={cycle} onChange={(e)=>setCycle(e.target.value)} />
          </div>
          <ActionButton variant="success" icon={Download} onClick={exportCsv}>تصدير CSV</ActionButton>
          <ActionButton variant="success" icon={FileSpreadsheet} onClick={exportPdf}>تصدير PDF</ActionButton>
        </div>
      </div>

      {/* أدوات الجدول */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5">
          <Search size={16} className="opacity-60" />
          <input
            placeholder="بحث باسم الموظف…"
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
            <option value="employee">الفرز: اسم الموظف</option>
            <option value="total">الفرز: المجموع</option>
            <option value="done">الفرز: المنجز</option>
            <option value="remain">الفرز: المتبقي</option>
          </select>
          <ChevronDown className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 opacity-60" size={16} />
        </div>
      </div>

      {/* جدول الموظفين (قراءة فقط) */}
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
                <th className="p-3 text-right">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}><EmptyState title="لا توجد بيانات" subtitle="لن تظهر صفوف إلا بعد إحالة استبيانات لمدير الإدارة." /></td>
                </tr>
              ) : filtered.map((r, idx) => (
                <tr key={`${idx}-${r.employee}`} className={twMerge('border-t border-black/5', idx%2===0 ? 'bg-white/60' : 'bg-white/40')}>
                  <td className="p-3 text-center">{idx+1}</td>
                  <td className="p-3">{r.employee}</td>
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

/* ============================== صفحة الأمين الإداري ============================== */
export default function AdminSecretaryPage() {
  const [lang, setLang] = useState('ar');

  // ارفعنا الـ queue هنا وضمّنا survey التفصيلي لكل عنصر
  const [queue, setQueue] = useState(() => ([
    {
      id: 's1',
      employeeName: 'محمد عبدالله',
      department: 'إدارة الرقابة على قطاعات الموارد الاقتصادية والطاقة',
      cycle: '2025-08',
      submittedAt: '2025-08-07T08:40:00Z',
      status: 'awaiting_secretary',
      topics: { total: 8, done: 6, remain: 2 },
      employeeNote: 'أرفقت جميع المستندات.',
      survey: sampleSurveyFor({ employeeName: 'محمد عبدالله', department: 'إدارة الرقابة على قطاعات الموارد الاقتصادية والطاقة', cycle: '2025-08' }),
    },
    {
      id: 's2',
      employeeName: 'هبة أحمد',
      department: 'إدارة الرقابة على قطاعات البنية الأساسية',
      cycle: '2025-08',
      submittedAt: '2025-08-06T13:05:00Z',
      status: 'returned_by_manager',
      topics: { total: 6, done: 4, remain: 2 },
      lastAction: { by: 'manager', at: '2025-08-06T14:00:00Z', note: 'يرجى توحيد صياغة الملخص.' },
      employeeNote: 'بانتظار التوجيه.',
      survey: sampleSurveyFor({ employeeName: 'هبة أحمد', department: 'إدارة الرقابة على قطاعات البنية الأساسية', cycle: '2025-08' }),
    },
    {
      id: 's3',
      employeeName: 'خليل الطيب',
      department: 'إدارة الرقابة على المجالس البلدية والجهات التابعة لها',
      cycle: '2025-08',
      submittedAt: '2025-08-05T15:20:00Z',
      status: 'sent_to_manager',
      topics: { total: 9, done: 9, remain: 0 },
      lastAction: { by: 'secretary', at: '2025-08-05T15:30:00Z', note: 'تم الإرسال للمدير.' },
      employeeNote: 'تمت المراجعة.',
      survey: sampleSurveyFor({ employeeName: 'خليل الطيب', department: 'إدارة الرقابة على المجالس البلدية والجهات التابعة لها', cycle: '2025-08' }),
    },
  ]));

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="relative bg-aca-beige text-aca-gray">
      {/* خلفية بسيطة */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#F7F2E6,#F4EDDF,#FFFDF8)] bg-[length:200%_200%] animate-[goldSheen_20s_linear_infinite]" />
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-aca-gold/20 blur-3xl" />
        <div className="absolute -bottom-52 -right-52 h-[600px] w-[600px] rounded-full bg-aca-green/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_24px_24px,rgba(0,0,0,0.35)_1.2px,transparent_1.2px)] [background-size:32px_32px]" />
      </div>

      {/* هيدر */}
      <header className="relative z-10 border-b border-black/5 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-md shadow" />
            <div>
              <div className={`${diwani.className} text-2xl bg-gradient-to-r from-[#AD8F2F] via-aca-gold to-[#E9DFA9] bg-clip-text text-transparent [background-size:200%_100%] animate-goldSheen`}>
                هيئة الرقابة الإدارية
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

      {/* المحتوى */}
      <main className="relative z-10 mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
        <SecretaryInbox queue={queue} setQueue={setQueue} />
        <SecretaryMonthlyStats queue={queue} />
      </main>

      <Toaster richColors position="top-center" />
    </div>
  );
}
