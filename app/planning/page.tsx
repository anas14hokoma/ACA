'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { twMerge } from 'tailwind-merge';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Eye, CheckCircle, X as IconX } from 'lucide-react';

/* ====================== خط العنوان (ديواني) ====================== */
const diwani = localFont({
  src: '../../public/fonts/Diwani.ttf', // تأكد من وجوده، أو غيّره لخطك
  display: 'swap',
});

/* ====================== أنواع البيانات ====================== */
type Topics = { total: number; done: number; remain: number };
type SurveyRow = {
  id: string;
  employeeName: string;
  department: string; // واحدة من 6 إدارات
  branch: 'طرابلس';
  cycle: string;      // YYYY-MM
  submittedAt: string; // ISO ثابت
  topics: Topics;
  approved?: boolean;
  survey?: any;
  // لإحصائية الجدول الشهري
  prev: number;     // المرحّل
  monthly: number;  // الوارد الشهري
  // ملاحظات اختيارية
  managerNote?: string;
  branchManagerNote?: string;
};

/* ====================== ألوان ذهبية ====================== */
const GOLD       = '#B8860B';
const GOLD_SOFT  = '#E6C765';
const GOLD_DARK  = '#A67C00';
const GOLD_AMBER = '#f59e0b';
const GOLD_TINT  = 'rgba(184,134,11,0.18)';

/* ====================== عناصر UI صغيرة ====================== */
function SectionCard({ title, children }:{title?:string; children:any}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-5">
      {title && <div className="mb-2 font-semibold text-[15px]" style={{color:'#2b2b2b'}}>{title}</div>}
      {children}
    </div>
  );
}

function KV({ label, value }:{label:string; value:any}) {
  return (
    <div className="flex items-start gap-2 text-[15px]">
      <span className="min-w-32 text-neutral-500">{label}</span>
      <span className="font-medium text-aca-gray whitespace-pre-wrap">{value ?? '—'}</span>
    </div>
  );
}

function SimpleTable({ columns=[], rows=[], getKey }:{
  columns: Array<{key:string; title:string; render?:(r:any)=>any}>;
  rows: any[];
  getKey?:(r:any,i:number)=>string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white/60 max-w-full">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-[15px] table-fixed">
          <thead className="bg-white/70">
            <tr className="border-b border-black/10">
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 text-right whitespace-nowrap text-[15px]">{c.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((r,i)=>(
              <tr key={getKey ? getKey(r,i) : i} className={twMerge('border-t border-black/5', i%2===0?'bg-white/60':'bg-white/40')}>
                {columns.map((c)=>(
                  <td key={c.key} className="px-3 py-2 align-top whitespace-pre-wrap">
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} className="p-4 text-center text-neutral-500">لا توجد بيانات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadershipNotes({ managerNote, branchManagerNote }:{managerNote?:string; branchManagerNote?:string}) {
  const hasManager = !!(managerNote && managerNote.trim());
  const hasBranch  = !!(branchManagerNote && branchManagerNote.trim());
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-[#E5D7A6] bg-[#FFF9E6] p-4">
        <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold text-[#8C6D00]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#B58900]" />
          ملاحظة مدير الإدارة
        </div>
        <div className="whitespace-pre-wrap text-[15px] text-[#5F4B00]">{hasManager ? managerNote : '—'}</div>
      </div>
      <div className="rounded-xl border border-[#BFE6C1] bg-[#F1FFF3] p-4">
        <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold text-[#1B5E20]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#2E7D32]" />
          ملاحظة مدير الفرع
        </div>
        <div className="whitespace-pre-wrap text-[15px] text-[#10491A]">{hasBranch ? branchManagerNote : '—'}</div>
      </div>
    </div>
  );
}

/* ====================== Tooltip أنيق ====================== */
function PrettyTooltip({ active, payload, label, labelPrefix }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-black/10 bg-white/95 p-3 text-[13px] shadow backdrop-blur">
      {label && <div className="mb-1 font-medium text-aca-gray">{labelPrefix}{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-neutral-700">{p.name}:</span>
          <strong className="text-aca-gray">{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

/* ====================== بناء نسخة الاستبيان الكاملة ====================== */
function buildFullSurveyFromRow(row: SurveyRow){
  const today = (row?.submittedAt ? new Date(row.submittedAt) : new Date()).toISOString().slice(0,10);
  const total  = Number(row?.topics?.total  ?? 0);
  const done   = Number(row?.topics?.done   ?? 0);
  const remain = Number(row?.topics?.remain ?? Math.max(total-done,0));

  return {
    branch: row.branch,
    fullName: row.employeeName || '—',
    cycle: row.cycle || '—',
    role: 'موظف فني',
    department: row.department || '—',
    degree: '—',
    major: '—',
    prev: row.prev,
    monthly: row.monthly,
    total, done, remain,
    notes: '',
    tasks: [
      { subject: 'مراجعة ملف', durationDays: 5, assignDate: today, doneDate: '', remark: '' },
    ],
    topicsPrev: row.prev,
    topicsMonthly: row.monthly,
    topicsTotal: total,
    topicsDone: done,
    topicsRemain: remain,
    topicsNotes: '',
    topics: [
      { number: row.id, summary: 'موضوع مرتبط بالاستبيان', assignDate: today, actionDate: '', actionType: 'متابعة' },
    ],
    remainingTopics: remain>0 ? [{ number: '—', summary: 'موضوع متبقٍ', assignDate: today, actionType: 'قيد الإنجاز' }] : [],
    reasonsJustifications: remain>0 ? 'نواقص بسيطة قيد الاستكمال.' : '',
    challengesDifficulties: '',
  };
}

/* ====================== عرض الاستبيان بالكامل ====================== */
function SurveyPreview({ survey, managerNote, branchManagerNote }:{
  survey:any; managerNote?:string; branchManagerNote?:string
}) {
  if (!survey) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[15px] text-amber-900">
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
        {notes && <div className="mb-3 text-[15px] text-neutral-700"><span className="text-neutral-500">ملاحظات: </span>{notes}</div>}
        <SimpleTable
          columns={[
            { key: 'subject',     title: 'موضوع التكليف' },
            { key: 'durationDays',title: 'مدة التكليف' },
            { key: 'assignDate',  title: 'تاريخ التكليف' },
            { key: 'doneDate',    title: 'تاريخ الإنجاز' },
            { key: 'remark',      title: 'ملاحظات' },
          ]}
          rows={tasks}
          getKey={(r,i)=>`${r.subject||''}-${i}`}
        />
      </SectionCard>

      <SectionCard title="الموضوعات المعروضة">
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <KV label=" المرحّل من الشهر السابق" value={topicsPrev} />
          <KV label="الوارد الشهري" value={topicsMonthly} />
          <KV label="المجموع" value={topicsTotal} />
          <KV label="المنجز" value={topicsDone} />
          <KV label="المتبقي" value={topicsRemain} />
        </div>
        {topicsNotes && <div className="mb-3 text-[15px] text-neutral-700"><span className="text-neutral-500">ملاحظات: </span>{topicsNotes}</div>}
        <SimpleTable
          columns={[
            { key: 'number',     title: 'رقم الموضوع' },
            { key: 'summary',    title: 'ملخص الموضوع' },
            { key: 'assignDate', title: 'تاريخ التكليف' },
            { key: 'actionDate', title: 'تاريخ التصرف' },
            { key: 'actionType', title: 'نوع التصرف' },
          ]}
          rows={topics}
          getKey={(r,i)=>`${r.number||''}-${i}`}
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
          getKey={(r,i)=>`${r.number||''}-${i}`}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-black/10 bg-white/80 p-3 text-[15px]">
            <div className="mb-1 text-neutral-500">أسباب ومبررات عدم الإنجاز</div>
            <div className="text-neutral-800 whitespace-pre-wrap">{reasonsJustifications || '—'}</div>
          </div>
          <div className="rounded-lg border border-black/10 bg-white/80 p-3 text-[15px]">
            <div className="mb-1 text-neutral-500">المشاكل والصعوبات</div>
            <div className="text-neutral-800 whitespace-pre-wrap">{challengesDifficulties || '—'}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ====================== داتا ديمو ثابتة (6 إدارات) ====================== */
const SIX_DEPTS = [
  'الخدمية والأمنية',
  'الموارد والطاقة',
  'البنية الأساسية',
  'المجالس البلدية',
  'الشكاوى والبلاغات',
  'المشروعات والدفعات',
] as const;

function makeStaticDemo(): SurveyRow[] {
  // ثابتة بالكامل لتجنّب أي اختلاف SSR/CSR
  const rows: SurveyRow[] = [
    { id:'S-2001', employeeName:'أحمد علي',   department:'الخدمية والأمنية', branch:'طرابلس', cycle:'2025-08', submittedAt:'2025-08-20T10:30:00.000Z', topics:{ total:18, done:10, remain:8 },  prev:6, monthly:12, approved:false, managerNote:'يرجى مراجعة المرفقات.', branchManagerNote:'تم الاطلاع.' },
    { id:'S-2002', employeeName:'هدى محمد',   department:'الموارد والطاقة',   branch:'طرابلس', cycle:'2025-08', submittedAt:'2025-08-19T12:10:00.000Z', topics:{ total:12, done:9,  remain:3 },  prev:4, monthly:8,  approved:true  },
    { id:'S-2003', employeeName:'محمد سعيد',  department:'الخدمية والأمنية', branch:'طرابلس', cycle:'2025-08', submittedAt:'2025-08-18T08:15:00.000Z', topics:{ total:20, done:11, remain:9 },  prev:8, monthly:12, approved:false },
    { id:'S-2004', employeeName:'ليلى علي',   department:'البنية الأساسية',   branch:'طرابلس', cycle:'2025-08', submittedAt:'2025-08-18T15:00:00.000Z', topics:{ total:14, done:7,  remain:7 },  prev:3, monthly:11, approved:true  },
    { id:'S-2005', employeeName:'سالم عمران', department:'المجالس البلدية',   branch:'طرابلس', cycle:'2025-08', submittedAt:'2025-08-17T09:45:00.000Z', topics:{ total:10, done:6,  remain:4 },  prev:2, monthly:8,  approved:false },
    { id:'S-2006', employeeName:'منى الطيب',  department:'الشكاوى والبلاغات', branch:'طرابلس', cycle:'2025-08', submittedAt:'2025-08-17T10:00:00.000Z', topics:{ total:16, done:12, remain:4 },  prev:5, monthly:11, approved:true  },
    { id:'S-2007', employeeName:'كمال علي',   department:'المشروعات والدفعات',branch:'طرابلس', cycle:'2025-08', submittedAt:'2025-08-16T14:20:00.000Z', topics:{ total:22, done:13, remain:9 },  prev:7, monthly:15, approved:false },
  ];
  return rows;
}

/* ====================== تبويب الإحصائية الشهرية ====================== */
function MonthlyStatsTab({ rows }:{ rows: SurveyRow[] }) {
  // فقط طرابلس
  const tripoli = useMemo(()=> rows.filter(r => r.branch==='طرابلس'), [rows]);

  // اتجاه شهري بسيط (ثابت من الداتا)
  const months = ['2025-04','2025-05','2025-06','2025-07','2025-08'];
  const monthlyAgg = months.map(m => {
    const subset = tripoli.filter(r => r.cycle===m);
    const total  = subset.reduce((a,r)=>a+r.topics.total, 0);
    const done   = subset.reduce((a,r)=>a+r.topics.done,  0);
    const remain = subset.reduce((a,r)=>a+r.topics.remain,0);
    return { month:m, total, done, remain, pct: total ? Math.round(done*100/total) : 0 };
  });

  // توزيع الحالة (معتمد/تحت المراجعة) — ديوغرافية مبسطة
  const demoDist = [
    { name:'معتمد', value: tripoli.filter(r=>r.approved).length },
    { name:'تحت المراجعة', value: tripoli.filter(r=>!r.approved).length },
  ];

  // تجميع حسب الإدارة: prev, monthly, total/done/remain
  type DeptRow = { dept:string; prev:number; monthly:number; total:number; done:number; remain:number };
  const perDept: DeptRow[] = useMemo(()=>{
    const acc = new Map<string, DeptRow>();
    SIX_DEPTS.forEach(d => acc.set(d, { dept:d, prev:0, monthly:0, total:0, done:0, remain:0 }));
    tripoli.forEach(r=>{
      const item = acc.get(r.department)!;
      item.prev    += r.prev;
      item.monthly += r.monthly;
      item.total   += r.topics.total;
      item.done    += r.topics.done;
      item.remain  += r.topics.remain;
    });
    return Array.from(acc.values());
  }, [tripoli]);

  const tableTotals = perDept.reduce((a,r)=>({
    prev:a.prev+r.prev, monthly:a.monthly+r.monthly, total:a.total+r.total, done:a.done+r.done, remain:a.remain+r.remain
  }), {prev:0, monthly:0, total:0, done:0, remain:0});
  const percentDone = tableTotals.total ? Math.round(tableTotals.done*100/tableTotals.total) : 0;

  const PIE_COLORS = [GOLD, GOLD_SOFT, GOLD_DARK, GOLD_AMBER, '#d97706', '#78350f'];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SectionCard>
          <div className="text-[13px] text-neutral-600">إجمالي الموضوعات</div>
          <div className="text-2xl font-semibold" style={{color:'#2b2b2b'}}>
            {tableTotals.total}
          </div>
        </SectionCard>
        <SectionCard>
          <div className="text-[13px] text-neutral-600">منجز</div>
          <div className="text-2xl font-semibold" style={{color:'#2b2b2b'}}>
            {tableTotals.done}
          </div>
        </SectionCard>
        <SectionCard>
          <div className="text-[13px] text-neutral-600">متبقي</div>
          <div className="text-2xl font-semibold" style={{color:'#2b2b2b'}}>
            {tableTotals.remain}
          </div>
        </SectionCard>
        <SectionCard>
          <div className="text-[13px] text-neutral-600">نسبة الإنجاز</div>
          <div className="text-2xl font-semibold" style={{color:'#2b2b2b'}}>
            {percentDone}%
          </div>
        </SectionCard>
      </div>

      {/* صف الرسوم: اتجاه + باي */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="الموضوعات عبر الأشهر">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
              <AreaChart data={monthlyAgg}>
                <defs>
                  <linearGradient id="kpiSparkGold" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="month"/><YAxis/>
                <Tooltip content={<PrettyTooltip labelPrefix="الشهر: " />} />
                <Legend />
                <Area type="monotone" dataKey="total"  name="إجمالي" stroke={GOLD}      fill="url(#kpiSparkGold)" strokeWidth={2} isAnimationActive={false}/>
                <Area type="monotone" dataKey="done"   name="منجز"   stroke={GOLD_SOFT}  fill={`${GOLD_SOFT}44`} strokeWidth={2} isAnimationActive={false}/>
                <Area type="monotone" dataKey="remain" name="متبقي"  stroke={GOLD_DARK}  fill={`${GOLD_DARK}33`} strokeWidth={2} isAnimationActive={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="ديوغرافية الاستبيانات — حسب الحالة">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
              <PieChart>
                <Tooltip content={<PrettyTooltip/>}/>
                <Legend/>
                <Pie data={demoDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={56} outerRadius={92} label isAnimationActive={false}>
                  {demoDist.map((_,i)=>(<Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* صف الرسوم: حسب الإدارة */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="الموضوعات حسب الإدارة">
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
              <BarChart data={perDept}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="dept" /><YAxis allowDecimals={false}/>
                <Tooltip content={<PrettyTooltip labelPrefix="الإدارة: " />} />
                <Legend />
                <Bar dataKey="total"  name="إجمالي" fill={GOLD}      radius={[6,6,0,0]} isAnimationActive={false}/>
                <Bar dataKey="done"   name="منجز"  fill={GOLD_SOFT}  radius={[6,6,0,0]} isAnimationActive={false}/>
                <Bar dataKey="remain" name="متبقي" fill={GOLD_DARK}  radius={[6,6,0,0]} isAnimationActive={false}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="رادار الإدارات">
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
              <RadarChart data={perDept} cx="50%" cy="50%" outerRadius="72%" margin={{ top: 16, bottom: 5, left: 16, right: 16 }}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="dept" />
                <PolarRadiusAxis />
                <Tooltip content={<PrettyTooltip />} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ marginTop: 20, fontSize: 13 }} />
                <Radar name="إجمالي" dataKey="total"  stroke={GOLD}      fill={GOLD}      fillOpacity={0.14} />
                <Radar name="منجز"   dataKey="done"   stroke={GOLD_SOFT}  fill={GOLD_SOFT}  fillOpacity={0.25} />
                <Radar name="متبقي"  dataKey="remain" stroke={GOLD_DARK}  fill={GOLD_DARK}  fillOpacity={0.20} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* جدول الإحصائية الشهرية للفرع */}
      <SectionCard title="الإحصائية الشهرية — فرع طرابلس (حسب الإدارات)">
        <div className="overflow-x-auto">
          <table className="min-w-full text-[15px] table-fixed">
            <thead className="bg-[#FFF7E6] text-amber-800">
              <tr>
                <th className="px-3 py-2 text-right">#</th>
                <th className="px-3 py-2 text-right">الإدارة</th>
                <th className="px-3 py-2 text-right">المرحّل</th>
                <th className="px-3 py-2 text-right">الوارد</th>
                <th className="px-3 py-2 text-right">إجمالي</th>
                <th className="px-3 py-2 text-right">منجز</th>
                <th className="px-3 py-2 text-right">متبقي</th>
                <th className="px-3 py-2 text-right">نسبة الإنجاز</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5">
              {perDept.length > 0 ? perDept.map((r, i) => (
                <tr key={r.dept} className="hover:bg-white">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-aca-gray">{r.dept}</td>
                  <td className="px-3 py-2">{r.prev}</td>
                  <td className="px-3 py-2">{r.monthly}</td>
                  <td className="px-3 py-2">{r.total}</td>
                  <td className="px-3 py-2">{r.done}</td>
                  <td className="px-3 py-2">{r.remain}</td>
                  <td className="px-3 py-2">
                    <span
                      className="rounded-md px-2 py-0.5 text-[12px]"
                      style={{ background:'#FFF7E0', border:'1px solid rgba(184,134,11,0.25)', color:'#7A5A0A' }}
                    >
                      {r.total ? Math.round((r.done * 100) / r.total) : 0}%
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-neutral-600">
                    لا توجد بيانات إدارات.
                  </td>
                </tr>
              )}
            </tbody>

            {perDept.length > 0 && (
              <tfoot>
                <tr className="bg-amber-50/80 font-semibold">
                  <td className="px-3 py-2 text-right"></td>
                  <td className="px-3 py-2 text-right">المجموع</td>
                  <td className="px-3 py-2">{tableTotals.prev}</td>
                  <td className="px-3 py-2">{tableTotals.monthly}</td>
                  <td className="px-3 py-2">{tableTotals.total}</td>
                  <td className="px-3 py-2">{tableTotals.done}</td>
                  <td className="px-3 py-2">{tableTotals.remain}</td>
                  <td className="px-3 py-2">
                    <span
                      className="rounded-md px-2 py-0.5 text-[12px]"
                      style={{ background:'#FFF7E0', border:'1px solid rgba(184,134,11,0.25)', color:'#7A5A0A' }}
                    >
                      {percentDone}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ====================== الصفحة الرئيسية: وحدة التخطيط (طرابلس) ====================== */
export default function PlanningTripoliPage() {
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<SurveyRow[]>([]);
  const [activeTab, setActiveTab] = useState<string>('__MONTHLY__'); // الإحصائية الشهرية أولاً
  const [subTab, setSubTab] = useState<'UNDER_REVIEW'|'APPROVED'>('UNDER_REVIEW');

  // نافذة العرض
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SurveyRow | null>(null);

  useEffect(() => {
    setMounted(true);
    setRows(makeStaticDemo());
  }, []);

  const tripoliRows = useMemo(()=> rows.filter(r => r.branch === 'طرابلس'), [rows]);

  const departments = useMemo(() => {
    const set = new Set<string>(SIX_DEPTS as unknown as string[]);
    // لو تحب توليد الإدارات ديناميكيًا من البيانات:
    tripoliRows.forEach(r => set.add(r.department || '—'));
    return Array.from(set).sort((a,b)=> a.localeCompare(b, 'ar'));
  }, [tripoliRows]);

  const listForActiveDept = useMemo(() => {
    if (activeTab==='__MONTHLY__') return [];
    const base = tripoliRows.filter(r => r.department === activeTab);
    return subTab==='UNDER_REVIEW' ? base.filter(r=>!r.approved) : base.filter(r=>!!r.approved);
  }, [tripoliRows, activeTab, subTab]);

  const openView = (row: SurveyRow) => { setSelected(row); setOpen(true); };
  const closeView = () => { setOpen(false); setSelected(null); };
  const toggleApprove = (row: SurveyRow) => {
    setRows(prev => prev.map(r => r.id === row.id ? { ...r, approved: !r.approved } : r));
    // يحدّث مباشرة في النافذة والجدول
  };

  const formatDate = (iso?:string) => {
    if(!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('ar-LY', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
    } catch { return iso as string; }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-[#FAF7F0] text-[#2b2b2b] overflow-x-hidden">
      {/* خلفية خفيفة */}
      <div className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_24px_24px,rgba(0,0,0,0.5)_1.2px,transparent_1.2px)] [background-size:32px_32px]" />
      </div>

      {/* هيدر */}
      <header className="relative z-10 border-b border-black/5 bg-white/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 sm:px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={44} height={44} className="rounded-md shadow" />
            <div>
              <div className={`${diwani.className} text-[22px] sm:text-2xl bg-gradient-to-r from-[#AD8F2F] via-[#D1B659] to-[#F0E2A2] bg-clip-text text-transparent [background-size:200%_100%]`}>
                هيئة الرقابة الإدارية — وحدة التخطيط
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-3 sm:px-4 py-6">
        {/* تبويبات عليا: الإحصائية الشهرية + الإدارات الست */}
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={()=>{ setActiveTab('__MONTHLY__'); }}
            className={twMerge(
              "rounded-xl border px-4 py-2 text-[15px] shadow-sm",
              activeTab==='__MONTHLY__'
                ? "bg-gradient-to-r from-[#F9F3E0] to-[#FFF7E6] border-amber-300 text-amber-800"
                : "bg-white/70 border-black/10 text-neutral-700 hover:bg-white"
            )}
          >
            الإحصائية الشهرية
          </button>

          {departments.map((d)=>(
            <button
              key={d}
              onClick={()=>{ setActiveTab(d); setSubTab('UNDER_REVIEW'); }}
              className={twMerge(
                "rounded-xl border px-4 py-2 text-[15px] shadow-sm",
                activeTab===d
                  ? "bg-gradient-to-r from-[#F9F3E0] to-[#FFF7E6] border-amber-300 text-amber-800"
                  : "bg-white/70 border-black/10 text-neutral-700 hover:bg-white"
              )}
              title={`إدارة ${d}`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* محتوى التبويب */}
        {activeTab==='__MONTHLY__' ? (
          <MonthlyStatsTab rows={tripoliRows}/>
        ) : (
          <>
            {/* تبويبات فرعية داخل الإدارة: تحت المراجعة / معتمد */}
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                onClick={()=>setSubTab('UNDER_REVIEW')}
                className={twMerge(
                  "rounded-lg border px-3 py-1.5 text-[14px]",
                  subTab==='UNDER_REVIEW'
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-white border-black/10 text-neutral-700"
                )}
              >
                تحت المراجعة
              </button>
              <button
                onClick={()=>setSubTab('APPROVED')}
                className={twMerge(
                  "rounded-lg border px-3 py-1.5 text-[14px]",
                  subTab==='APPROVED'
                    ? "bg-green-50 border-green-300 text-green-800"
                    : "bg-white border-black/10 text-neutral-700"
                )}
              >
                معتمد
              </button>
            </div>

            {/* جدول السجلات */}
            <div className="rounded-2xl border border-black/10 bg-white/70 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-[15px] table-fixed">
                  <thead className="bg-[#FFF7E6] text-amber-800">
                    <tr>
                      <th className="px-3 py-2 text-right">#</th>
                      <th className="px-3 py-2 text-right">الموظف</th>
                      <th className="px-3 py-2 text-right">الإدارة</th>
                      <th className="px-3 py-2 text-right">الشهر</th>
                      <th className="px-3 py-2 text-right">إجمالي</th>
                      <th className="px-3 py-2 text-right">منجز</th>
                      <th className="px-3 py-2 text-right">متبقي</th>
                      <th className="px-3 py-2 text-right">التاريخ</th>
                      <th className="px-3 py-2 text-right">الحالة</th>
                      <th className="px-3 py-2 text-right">عرض</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {listForActiveDept.map((r, i)=>(
                      <tr key={r.id} className="hover:bg-white">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">{r.employeeName}</td>
                        <td className="px-3 py-2">{r.department}</td>
                        <td className="px-3 py-2">{r.cycle || '—'}</td>
                        <td className="px-3 py-2">{r.topics.total}</td>
                        <td className="px-3 py-2">{r.topics.done}</td>
                        <td className="px-3 py-2">{r.topics.remain}</td>
                        <td className="px-3 py-2">{formatDate(r.submittedAt)}</td>
                        <td className="px-3 py-2">
                          {r.approved ? (
                            <span className="rounded-md bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 text-[12px]">معتمد</span>
                          ) : (
                            <span className="rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[12px]">تحت المراجعة</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={()=>{ setSelected(r); setOpen(true); }}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-[#FFF7E6] px-2.5 py-1.5 text-[13px] text-amber-800 hover:opacity-90"
                            title="عرض الاستبيان الكامل"
                          >
                            <Eye size={16}/> عرض
                          </button>
                        </td>
                      </tr>
                    ))}
                    {listForActiveDept.length===0 && (
                      <tr>
                        <td colSpan={10} className="px-3 py-6 text-center text-neutral-600">
                          لا توجد سجلات لهذا التبويب.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* نافذة عرض الاستبيان + زر الاعتماد */}
        {open && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 md:backdrop-blur-sm" onClick={()=>{ setOpen(false); setSelected(null); }} />
            <div className="relative z-10 w-[min(960px,96vw)] max-h-[90vh] overflow-y-auto rounded-2xl border border-black/10 bg-white p-5 shadow-xl">
              {/* شريط علوي */}
              <div className="sticky top-0 z-10 mb-3 flex items-center justify-between border-b border-black/10 bg-white/95 px-1 py-2">
                <div className="text-[15px] font-semibold" style={{color:'#2b2b2b'}}>
                  عرض الاستبيان — <span className="text-amber-700">{selected.employeeName}</span> • {selected.cycle}
                </div>
                <div className="flex items-center gap-2">
                  {/* زر اعتماد/إلغاء اعتماد */}
                  <button
                    onClick={()=>toggleApprove(selected)}
                    className={twMerge(
                      "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[13px] border hover:opacity-95",
                      selected.approved
                        ? "bg-white border-green-300 text-green-700"
                        : "bg-green-600 border-green-700 text-white"
                    )}
                    title={selected.approved ? "إلغاء الاعتماد" : "اعتماد الاستبيان"}
                  >
                    <CheckCircle size={16}/>
                    {selected.approved ? 'إلغاء الاعتماد' : 'اعتماد'}
                  </button>

                  <button onClick={()=>{ setOpen(false); setSelected(null); }} className="rounded-full p-2 hover:bg-black/5" title="إغلاق">
                    <IconX size={18}/>
                  </button>
                </div>
              </div>

              <SurveyPreview
                survey={ selected.survey ?? buildFullSurveyFromRow(selected) }
                managerNote={selected.managerNote}
                branchManagerNote={selected.branchManagerNote}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
