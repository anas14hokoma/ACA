'use client';
import { ArrowRight } from 'lucide-react';
import { Noto_Naskh_Arabic } from 'next/font/google';

const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['700'],
  display: 'swap',
});

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { twMerge } from 'tailwind-merge';
import {
  ShieldCheck, Lock, ChevronRight, X as IconX, Eye
} from 'lucide-react';

// Recharts
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

/* ====== خط العنوان ====== */
const diwani = localFont({
  src: '../../public/fonts/Diwani.ttf',
  display: 'swap',
});
// يحل مشكلة اختلاف استيراد jsPDF بين الإصدارات
async function getJsPDF() {
  const m = await import('jspdf');
  // بعض الإصدارات تصدّر default، وبعضها named jsPDF
  return (m as any).default ? (m as any).default : (m as any).jsPDF;
}

// ArrayBuffer -> Base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// حمّل الخط العربي وسجّله في jsPDF (مرة وحدة)
async function ensureArabicFont(doc: any) {
  if ((ensureArabicFont as any)._loaded) return;

  // تأكد أن الملف موجود في public/fonts
  const res = await fetch('/fonts/NotoNaskh-Regular.ttf');
  if (!res.ok) throw new Error('Font fetch failed: ' + res.status);
  const buf = await res.arrayBuffer();
  const base64 = arrayBufferToBase64(buf);

  // سجّل الخط داخل VFS ثم addFont بإسم ثابت "NotoNaskh"
  doc.addFileToVFS('NotoNaskh-Regular.ttf', base64);
  doc.addFont('NotoNaskh-Regular.ttf', 'NotoNaskh', 'normal');
  // أحياناً نضيف alias ثاني احتياط
  try { doc.addFont('NotoNaskh-Regular.ttf', 'NotoNaskh-Regular', 'normal'); } catch {}

  (ensureArabicFont as any)._loaded = true;
}

/* ====== Tooltip أنيق عام ====== */
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

/* ==================== ألوان ذهبية ثابتة ==================== */
const GOLD       = '#B8860B';
const GOLD_SOFT  = '#E6C765';
const GOLD_DARK  = '#A67C00';
const GOLD_AMBER = '#f59e0b';
const GOLD_TINT  = 'rgba(184,134,11,0.18)';

function TrendChip({ label, value, up=true }: {label:string; value:string|number; up?:boolean}) {
  return (
    <span className={twMerge(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium ring-1",
      up ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-rose-50 text-rose-700 ring-rose-200"
    )}>
      <span className={twMerge("h-1.5 w-1.5 rounded-full", up ? "bg-amber-500" : "bg-rose-500")} />
      {label}: <strong className="font-semibold">{value}</strong>
    </span>
  );
}

function GlassCard({ title, subtitle, children, className }:{title?:string; subtitle?:string; children:any; className?:string}) {
  return (
    <div className={twMerge(
      "group relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-5 backdrop-blur shadow hover:shadow-lg transition-shadow",
      className
    )}>
      {/* هالات ذهبية */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-52 w-52 rounded-full blur-3xl"
           style={{ background: GOLD_TINT }} />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-40 w-40 rounded-full blur-3xl"
           style={{ background: 'rgba(230,199,101,0.16)' }} />
      <div className="relative z-10">
        {(title || subtitle) && (
          <div className="mb-2">
            <div className="text-[15px] font-semibold" style={{color:'#2b2b2b'}}>{title}</div>
            {subtitle && <div className="text-[12px] text-neutral-600">{subtitle}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function BigKPI({ title, value, suffix="", hint, trend=[] }:{title:string; value:number|string; suffix?:string; hint?:string; trend?:number[]}) {
  const safe = Array.isArray(trend) ? trend : [];
  return (
    <GlassCard>
      <div className="flex items-end justify-between">
        <div>
          <div className="mb-1 text-[13px] text-neutral-600">{title}</div>
          <div className="text-[28px] sm:text-3xl font-semibold" style={{color:'#2b2b2b'}}>
            {value}<span className="text-base align-super ml-1">{suffix}</span>
          </div>
          {hint && <div className="mt-1 text-[12px] text-neutral-500">{hint}</div>}
        </div>
        <div className="h-12 w-32">
          <ResponsiveContainer width="100%" height="100%" debounce={200} className="chart-wrap">
            <AreaChart data={safe.map((y,i)=>({x:i,y}))}>
              <defs>
                <linearGradient id="kpiSparkGold" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="y" stroke={GOLD} fill="url(#kpiSparkGold)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

/* ==================== مساعدات حسابية ==================== */
function timelineByStatus(surveysAll:any[]){
  const agg: any = {};
  surveysAll.forEach(s=>{
    const k = s.cycle || 'غير محدد';
    if(!agg[k]) agg[k] = { cycle: k, awaiting_inspection:0, noted:0, finalized:0, total:0 };
    agg[k][s.status] += (s?.topics?.total || 0);
    agg[k].total     += (s?.topics?.total || 0);
  });
  return Object.values(agg).sort((a:any,b:any)=>a.cycle.localeCompare(b.cycle));
}
function progressFromSheet(sheetAll:any[]){
  const t = sheetAll.reduce((a:any,r:any)=>{ a.total+=r.total; a.done+=r.done; return a; },{total:0,done:0});
  const pct = t.total ? Math.round(t.done*100/t.total) : 0;
  return { total: t.total, done: t.done, pct };
}
function topEmployees(statsAll:any[], n=5){
  const arr = [...statsAll];
  arr.sort((a:any,b:any)=> (b.done - a.done) || (a.remain - b.remain));
  return arr.slice(0,n);
}
function smartAlerts(surveysAll:any[]){
  const byBranch:any = {};
  surveysAll.forEach(s=>{
    const b = s.branch;
    if(!byBranch[b]) byBranch[b] = { total:0, remain:0, awaiting:0 };
    byBranch[b].total += s?.topics?.total || 0;
    byBranch[b].remain += s?.topics?.remain || 0;
    if (s.status === 'awaiting_inspection') byBranch[b].awaiting++;
  });
  const items = Object.entries(byBranch).map(([branch,v]:any)=>{
    const risk = v.total ? v.remain/v.total : 0;
    return { branch, risk, awaiting: v.awaiting, remain: v.remain, total: v.total };
  }).filter((x:any)=>x.total>0);
  items.sort((a:any,b:any)=> b.risk - a.risk);
  return items.slice(0,3);
}

/* ===== ترند شهري من بيانات cycles (YYYY-MM) لطرابلس ===== */
function makeMonthlyTrends(surveysAll:any[], depFilter?: string){
  const monthSet = new Set<string>();
  surveysAll
    .filter(s=> (s.branch||'')==='طرابلس' && (!depFilter || (s.department||'—')===depFilter))
    .forEach(s=> monthSet.add(s.cycle || '—'));
  const months = Array.from(monthSet).sort((a,b)=> a.localeCompare(b));

  const aggByMonth: Record<string,{total:number;done:number;remain:number}> = {};
  months.forEach(m=> aggByMonth[m] = { total:0, done:0, remain:0 });

  surveysAll
    .filter(s=> (s.branch||'')==='طرابلس' && (!depFilter || (s.department||'—')===depFilter))
    .forEach(s=>{
      const m = s.cycle || months[0] || '—';
      if(!aggByMonth[m]) aggByMonth[m] = { total:0, done:0, remain:0 };
      aggByMonth[m].total  += s?.topics?.total  || 0;
      aggByMonth[m].done   += s?.topics?.done   || 0;
      aggByMonth[m].remain += s?.topics?.remain || 0;
    });

  const trendTotal  = months.map(m=> aggByMonth[m].total);
  const trendDone   = months.map(m=> aggByMonth[m].done);
  const trendRemain = months.map(m=> aggByMonth[m].remain);
  const trendPct    = months.map(m=>{
    const t = aggByMonth[m];
    return t.total ? Math.round(t.done*100/t.total) : 0;
  });

  const totals = months.reduce((a, m)=>({
    total : a.total  + aggByMonth[m].total,
    done  : a.done   + aggByMonth[m].done,
    remain: a.remain + aggByMonth[m].remain
  }), { total:0, done:0, remain:0 });

  return { months, trendTotal, trendDone, trendRemain, trendPct, totals };
}

/* ==================== الداشبورد الذهبية ==================== */
function SuperDashboard({ surveysAll, sheetAll, statsAll, branches }:{
  surveysAll:any[]; sheetAll:any[]; statsAll:any[]; branches:any[]
}) {
  const tl   = useMemo(()=>timelineByStatus(surveysAll),[surveysAll]);
  const prog = useMemo(()=>progressFromSheet(sheetAll),[sheetAll]);

  const kpiTrend1 = [8,10,7,12,14,11,16,18];
  const kpiTrend2 = [22,28,26,30,36,34,40,44];
  const kpiTrend3 = [40,45,50,52,56,60,63,65];
  const kpiTrend4 = [2,3,4,4,5,5,5,5];

  // ✅ بدلاً من useMemo داخل JSX:
  const barByBranch = useMemo(() => {
    const acc:any = {};
    surveysAll.forEach(s=>{
      const b = s.branch || 'غير محدد';
      if(!acc[b]) acc[b] = { branch:b, total:0, done:0, remain:0 };
      acc[b].total  += s?.topics?.total  || 0;
      acc[b].done   += s?.topics?.done   || 0;
      acc[b].remain += s?.topics?.remain || 0;
    });
    return Object.values(acc);
  }, [surveysAll]);

  const bestEmployees = useMemo(()=> topEmployees(statsAll,5), [statsAll]);
  // ⚠️ smartAlerts تستقبل surveysAll وليس statsAll
  const alerts = useMemo(()=> smartAlerts(surveysAll), [surveysAll]);

  const PIE_COLORS = [GOLD, GOLD_SOFT, GOLD_DARK, GOLD_AMBER, '#d97706', '#78350f', '#fde68a', '#8b7355'];

  return (
    <>
      {/* أعلى الداشبورد */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[15px] text-neutral-700">
          <TrendChip label="معدل الإنجاز" value={`${prog.pct}%`} up={prog.pct>=50}/>
          <TrendChip label="إجمالي الموضوعات" value={prog.total} up />
          <TrendChip label="منجز" value={prog.done} up />
        </div>
        <div className="flex items-center gap-2 text-[15px]">
          <div className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 shadow-sm">
            نطاق زمني: <strong className="text-aca-gray">آخر 6 أشهر</strong>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 shadow-sm">
            الفروع: <strong className="text-aca-gray">{branches?.length || 0}</strong>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigKPI title="إجمالي الاستبيانات" value={surveysAll.length} hint="كل الفروع" trend={kpiTrend1}/>
        <BigKPI title="إجمالي الموضوعات" value={prog.total} hint="من الكشوف" trend={kpiTrend2}/>
        <BigKPI title="نسبة الإنجاز العامة" value={prog.pct} suffix="%" hint="منجز/إجمالي" trend={kpiTrend3}/>
        <BigKPI title="عدد الفروع" value={branches?.length || 0} hint="مُغطاة" trend={kpiTrend4}/>
      </div>

      {/* شبكة الرسوم */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Area timeline */}
        <GlassCard title="الموضوعات عبر الزمن" subtitle="مكدس حسب الحالة" className="xl:col-span-2">
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%" debounce={200} className="chart-wrap">
              <AreaChart data={tl}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="cycle"/><YAxis/>
                <Tooltip content={<PrettyTooltip labelPrefix="الشهر: "/>} />
                <Legend />
                <Area type="monotone" dataKey="awaiting_inspection" name="بانتظار التفتيش" stackId="s" stroke={GOLD_AMBER} fill={`${GOLD_AMBER}55`} isAnimationActive={false}/>
                <Area type="monotone" dataKey="noted"               name="مراجَع"           stackId="s" stroke={GOLD_SOFT}  fill={`${GOLD_SOFT}55`}  isAnimationActive={false}/>
                <Area type="monotone" dataKey="finalized"           name="مكتمل"            stackId="s" stroke={GOLD}       fill="rgba(184,134,11,0.34)" isAnimationActive={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pie — حالات */}
        <GlassCard title="توزيع الحالات" subtitle="نظرة سريعة">
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%" debounce={200} className="chart-wrap">
              <PieChart>
                <Tooltip content={<PrettyTooltip/>}/>
                <Legend/>
                <Pie
                  data={(() => {
                    const acc:any = {};
                    surveysAll.forEach(s=>acc[s.status]=(acc[s.status]||0)+1);
                    return Object.entries(acc).map(([status,value])=>({status,value}));
                  })()}
                  dataKey="value" nameKey="status" cx="50%" cy="50%" innerRadius={64} outerRadius={104} label
                  isAnimationActive={false}
                >
                  {Array.from({length:8}).map((_,i)=>(
                    <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Bar — حسب الفرع (باستخدام barByBranch) */}
        <GlassCard title="الموضوعات حسب الفرع" subtitle="إجمالي/منجز/متبقي" className="xl:col-span-2">
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%" debounce={200} className="chart-wrap">
              <BarChart data={barByBranch}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="branch"/><YAxis/>
                <Tooltip content={<PrettyTooltip labelPrefix="الفرع: "/>} />
                <Legend/>
                <Bar dataKey="total"  name="إجمالي" fill={GOLD}      radius={[6,6,0,0]} isAnimationActive={false}/>
                <Bar dataKey="done"   name="منجز"  fill={GOLD_SOFT}  radius={[6,6,0,0]} isAnimationActive={false}/>
                <Bar dataKey="remain" name="متبقي" fill={GOLD_DARK}  radius={[6,6,0,0]} isAnimationActive={false}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* أفضل الموظفين + تنبيهات (بدون useMemo داخل JSX) */}
        <div className="grid grid-cols-1 gap-6">
          <GlassCard title="أفضل 5 موظفين إنجازًا" subtitle="حسب عدد المنجز">
            <div className="mt-2 divide-y divide-black/5">
              {bestEmployees.map((r:any,i:number)=>(
                <div key={i} className="flex items-center justify-between py-2 text-[15px]">
                  <div className="min-w-0">
                    <div className="font-medium text-aca-gray truncate">{r.employee}</div>
                    <div className="text-[12px] text-neutral-600 truncate">{r.dept} — {r.branch}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md px-2 py-0.5 text-[12px]" style={{background:'#FFF7E0', color:'#8B6508', border:'1px solid rgba(184,134,11,0.25)'}}>منجز: {r.done}</span>
                    <span className="rounded-md bg-black/5 px-2 py-0.5 text-[12px]">متبقي: {r.remain}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="تنبيهات ذكية" subtitle="تُحسب تلقائيًا">
            <div className="mt-2 space-y-2 text-[15px]">
              {alerts.length === 0 ? (
                <div className="text-neutral-600">لا توجد تنبيهات مرتفعة الخطورة الآن.</div>
              ) : alerts.map((a:any, i:number)=>(
                <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2"
                     style={{ background:'#FFF7E6', borderColor:'rgba(184,134,11,0.25)', color:'#7A5A0A' }}>
                  <div>
                    <strong>فرع {a.branch}</strong> — نسبة المتبقي <strong>{Math.round(a.risk*100)}%</strong>
                  </div>
                  <div className="text-[12px]">بانتظار التفتيش: {a.awaiting} • متبقي: {a.remain} / إجمالي: {a.total}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}


/* ==================== شبكة الفروع ==================== */
function BranchGrid({ branches, onEnter }:{branches:any[]; onEnter:(b:any)=>void}) {
  return (
    <GlassCard title="الفروع" subtitle="يمكنك الاستعراض للجميع — الدخول مفعّل لفرع طرابلس فقط">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {branches.map((b:any, i:number)=>(
          <div key={i} className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-5 shadow">
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl"
                 style={{ background: GOLD_TINT }} />
            <div className="relative z-10">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[15px] font-semibold" style={{color:'#2b2b2b'}}>{b.name}</div>
                <div className="text-[12px] text-neutral-500">{b.code}</div>
              </div>
              <div className="mb-3 grid grid-cols-3 gap-2 text-center text-[12px]">
                <div className="rounded-md bg-black/5 p-2">
                  <div className="font-semibold text-aca-gray">{b.metrics.total}</div>
                  <div className="text-neutral-600">إجمالي</div>
                </div>
                <div className="rounded-md p-2" style={{ background:'#FFF7E0', border:'1px solid rgba(184,134,11,0.25)'}}>
                  <div className="font-semibold" style={{color:'#8B6508'}}>{b.metrics.done}</div>
                  <div className="text-neutral-600">منجز</div>
                </div>
                <div className="rounded-md bg-amber-50 p-2">
                  <div className="font-semibold text-amber-700">{b.metrics.remain}</div>
                  <div className="text-neutral-600">متبقي</div>
                </div>
              </div>

              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%" debounce={200} className="chart-wrap">
                  <AreaChart data={b.spark.map((y:number, x:number)=>({ x, y }))}>
                    <defs>
                      <linearGradient id={`g-${b.code}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={GOLD} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="y" stroke={GOLD} fill={`url(#g-${b.code})`} strokeWidth={2} isAnimationActive={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3">
                {b.enabled ? (
                  <button
                    onClick={()=>onEnter(b)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[15px] text-white shadow hover:opacity-95"
                    style={{ background: GOLD }}
                  >
                    دخول الفرع <ChevronRight size={16}/>
                  </button>
                ) : (
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-[15px] text-neutral-500 shadow cursor-not-allowed"
                    title="الدخول لهذا الفرع غير متاح في هذه المرحلة"
                    disabled
                  >
                    <Lock size={16}/> عرض فقط
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ==================== عناصر مساعدة لعرض الاستبيان الكامل ==================== */
function SectionCard({ title, children }:{title?:string; children:any}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-5">
      {title && <div className="mb-2 font-semibold text-aca-gray text-[15px]">{title}</div>}
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
function SimpleTable({ columns=[], rows=[], getKey }:{columns:any[]; rows:any[]; getKey?:(r:any,i:number)=>string}) {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white/60 max-w-full">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-[15px] table-fixed">
          <thead className="bg-white/70">
            <tr className="border-b border-black/10">
              {columns.map((c:any) => (
                <th key={c.key} className="px-3 py-2 text-right whitespace-nowrap text-[15px]">{c.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((r,i)=>(
              <tr key={getKey ? getKey(r,i) : i} className={twMerge('border-t border-black/5', i%2===0?'bg-white/60':'bg-white/40')}>
                {columns.map((c:any)=>(
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

/* يبني استبيان كامل من صف بسيط إن لم تتوفر نسخة كاملة داخله */
function buildFullSurveyFromRow(row:any){
  const today = (row?.submittedAt ? new Date(row.submittedAt) : new Date()).toISOString().slice(0,10);
  const total  = Number(row?.topics?.total  ?? 0);
  const done   = Number(row?.topics?.done   ?? 0);
  const remain = Number(row?.topics?.remain ?? Math.max(total-done,0));

  return {
    branch: row.branch || 'طرابلس',
    fullName: row.employeeName || '—',
    cycle: row.cycle || '—',
    role: 'موظف فني',
    department: row.department || '—',
    degree: '—',
    major: '—',
    prev: Math.max(total-done,0) > remain ? remain : 0,
    monthly: total, total, done, remain,
    notes: '',
    tasks: [
      { subject: 'مراجعة ملف', durationDays: 5, assignDate: today, doneDate: '', remark: '' },
    ],
    topicsPrev: 0,
    topicsMonthly: total,
    topicsTotal: total,
    topicsDone: done,
    topicsRemain: remain,
    topicsNotes: '',
    topics: [
      { number: row.id, summary: 'موضوع عام مرتبط بالاستبيان', assignDate: today, actionDate: '', actionType: 'متابعة' },
    ],
    remainingTopics: remain>0 ? [{ number: '—', summary: 'موضوع متبقٍ', assignDate: today, actionType: 'قيد الإنجاز' }] : [],
    reasonsJustifications: remain>0 ? 'نواقص بسيطة قيد الاستكمال.' : '',
    challengesDifficulties: '',
  };
}

/* معاينة الاستبيان الكامل */
function SurveyPreview({ survey, managerNote, branchManagerNote }:{survey:any; managerNote?:string; branchManagerNote?:string}) {
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

// يدز الاسم لبرا + يجزّئه لسطرين إذا كان طويل
const splitLabel = (label: string, maxLen = 16) => {
  const words = (label || '').split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxLen) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line ? line + ' ' : '') + w;
    }
    if (lines.length === 1 && line.length > maxLen) break; // سطرين كحد أقصى
  }
  if (line) lines.push(line.trim());
  if (lines.length > 2) {
    const [a, b] = lines;
    return [a, b + '…']; // قص بسيط
  }
  return lines;
};

// 1) حوّل الدالة إلى مكوّن React
const PolarDeptTick: React.FC<any> = (props) => {
  const { x, y, cx, cy, payload } = props;
  const label = payload?.value || '';
  const neat = label
    .replace('إدارة الرقابة على ', '')
    .replace('الجهات التابعة لها', '')
    .replace('قطاعات ', '');
  const lines = splitLabel(neat, 16);

  const dx = x - cx, dy = y - cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const off = 16;
  const lx = x + (dx / len) * off;
  const ly = y + (dy / len) * off;

  const lineHeight = 13;
  const startDy = -(lines.length - 1) * (lineHeight / 2);

  return (
    <text
      x={lx}
      y={ly}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fill="#7A5A0A"
      style={{ pointerEvents: 'none' }}
    >
      {lines.map((ln: string, i: number) => (
        <tspan key={i} x={lx} dy={i === 0 ? startDy : lineHeight}>
          {ln}
        </tspan>
      ))}
    </text>
  );
};


/* ==================== تبويب إحصائية طرابلس ==================== */
/* ==================== تبويب إحصائية طرابلس (نسخة موحّدة) ==================== */
function TripoliMonthlyTab({
  surveysAll, activeBranch, sheetAll = [],
}: { surveysAll:any[]; activeBranch:any; sheetAll?:any[] }) {

  const { trendTotal, trendDone, trendRemain, trendPct, totals } =
    useMemo(() => makeMonthlyTrends(surveysAll), [surveysAll]);

  const pmByDept = useMemo(() => {
    const m = new Map<string, { prev:number; monthly:number }>();
    (sheetAll || []).forEach((r:any) => {
      const dep = String(r.department || '—');
      const prev = Number(r.prev ?? 0);
      const monthly = Number(r.monthly ?? 0);
      const o = m.get(dep) || { prev:0, monthly:0 };
      m.set(dep, { prev: o.prev + prev, monthly: o.monthly + monthly });
    });
    return m;
  }, [sheetAll]);

  const tripoli = useMemo(() => {
    const acc:any = {};
    surveysAll.filter(s => (s.branch||'')==='طرابلس').forEach(s => {
      const dep = s.department || '—';
      if (!acc[dep]) acc[dep] = { dept:dep, total:0, done:0, remain:0, prev:0, monthly:0 };
      const total  = Number(s?.topics?.total  ?? 0);
      const done   = Number(s?.topics?.done   ?? 0);
      const remain = Number(s?.topics?.remain ?? Math.max(total-done,0));
      acc[dep].total  += total;
      acc[dep].done   += done;
      acc[dep].remain += remain;
    });

    const deps = Object.keys(acc);
    let usedSheet = false;
    deps.forEach(dep => {
      const pm = pmByDept.get(dep);
      if (pm && (pm.prev>0 || pm.monthly>0)) {
        acc[dep].prev    = pm.prev;
        acc[dep].monthly = pm.monthly;
        usedSheet = true;
      }
    });

    if (!usedSheet) {
      surveysAll.filter(s => (s.branch||'')==='طرابلس').forEach(s => {
        const dep = s.department || '—';
        const total = Number(s?.topics?.total ?? 0);
        const done  = Number(s?.topics?.done  ?? 0);
        const prev    = Number(((s as any).prev ?? (s as any).topicsPrev) ?? 0);
        const monthly = Number(((s as any).monthly ?? (s as any).topicsMonthly) ?? Math.max(total - prev, 0));
        acc[dep].prev    += prev;
        acc[dep].monthly += monthly;
      });
    }

    return Object.values(acc).sort((a:any,b:any)=> a.dept.localeCompare(b.dept,'ar'));
  }, [surveysAll, pmByDept]);

  const tableTotals = useMemo(() => (tripoli as any[]).reduce((a:any,r:any)=>({
    prev:a.prev+(r.prev||0), monthly:a.monthly+(r.monthly||0),
    total:a.total+r.total, done:a.done+r.done, remain:a.remain+r.remain
  }), {prev:0,monthly:0,total:0,done:0,remain:0}), [tripoli]);

  const percentDone = tableTotals.total ? Math.round((tableTotals.done*100)/tableTotals.total) : 0;

  // ✅ بدلاً من useMemo داخل JSX:
  const barDataTripoli = useMemo(() => tripoli as any[], [tripoli]);

  // === بقية JSX كما هو تقريبًا، فقط غيّر BarChart ليستخدم barDataTripoli ===
  return (
    <GlassCard title="الإحصائية الشهرية — فرع طرابلس" subtitle="كل الرسومات والجداول هنا فقط">
      {/* KPIs */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigKPI title="إجمالي الموضوعات" value={totals.total} hint="طرابلس" trend={trendTotal} />
        <BigKPI title="منجز" value={totals.done} hint="طرابلس" trend={trendDone} />
        <BigKPI title="متبقي" value={totals.remain} hint="طرابلس" trend={trendRemain} />
        <BigKPI title="نسبة الإنجاز" value={percentDone} suffix="%" hint="طرابلس" trend={trendPct} />
      </div>

      {/* الصف الثاني (التغيير هنا فقط) */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-[380px] rounded-xl border border-black/10 bg-white/60 p-4">
          <ResponsiveContainer width="100%" height="100%" debounce={200} className="chart-wrap">
            <BarChart data={barDataTripoli}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dept" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<PrettyTooltip labelPrefix="الإدارة: " />} />
              <Legend />
              <Bar dataKey="total"  name="إجمالي" fill={GOLD}      radius={[6, 6, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="done"   name="منجز"  fill={GOLD_SOFT}  radius={[6, 6, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="remain" name="متبقي" fill={GOLD_DARK}  radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* الرادار كما هو */}
        <div className="h-[360px] rounded-xl border border-black/10 bg-white/60 p-3">
          <ResponsiveContainer width="100%" height="100%" debounce={200} className="chart-wrap">
          <RadarChart data={barDataTripoli} cx="50%" cy="50%" outerRadius="72%" margin={{ top: 16, bottom: 5, left: 16, right: 16 }}>
  <PolarGrid gridType="polygon" />
  {/* 2) مرّر عنصر بدل الدالة، واحذف tickMargin */}
  <PolarAngleAxis dataKey="dept" tick={<PolarDeptTick />} />
  <PolarRadiusAxis />
  <Tooltip content={<PrettyTooltip />} />
  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ marginTop: 20, fontSize: 13 }} />
 

              <Radar name="إجمالي" dataKey="total"  stroke={GOLD}      fill={GOLD}      fillOpacity={0.14} />
              <Radar name="منجز"  dataKey="done"   stroke={GOLD_SOFT}  fill={GOLD_SOFT}  fillOpacity={0.25} />
              <Radar name="متبقي" dataKey="remain" stroke={GOLD_DARK}  fill={GOLD_DARK}  fillOpacity={0.20} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* صندوق جدول الإدارات — بدون تغييرات */}
      {/* ... نفس الجدول والتصدير CSV/PDF كما عندك ... */}
    </GlassCard>
  );
}



/* ==================== تبويب تفاصيل إدارة محددة داخل طرابلس ==================== */
function DeptDetailTab({ surveysAll, dept }:{surveysAll:any[]; dept:string}) {
  const rows = useMemo(()=> {
    return surveysAll
      .filter(s => (s.branch || '') === 'طرابلس' && (s.department||'—') === dept)
      .sort((a,b)=> (a.cycle||'').localeCompare(b.cycle||''));
  },[surveysAll, dept]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const openView = (row:any) => { setSelected(row); setOpen(true); };
  const closeView = () => { setOpen(false); setSelected(null); };

  const formatDate = (iso?:string) => {
    if(!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('ar-LY', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
    } catch { return iso; }
  };

  // Helpers
  const ensureFullSurvey = (row:any) => (row?.survey ?? buildFullSurveyFromRow(row));
  const sanitizeFileName = (s: string) => s.replace(/[\\/:*?"<>|]/g, '').trim() || 'export';

  const exportFullSurveyToCSV = (row:any) => {
    const s = ensureFullSurvey(row);
    const headers = ['الاسم','الفرع','الشهر','الوظيفة','الإدارة','المؤهل','التخصص','المرحّل','الوارد الشهري','المجموع','المنجز','المتبقي'];
    const line = [
      s.fullName, s.branch, s.cycle, s.role, s.department, s.degree, s.major,
      s.prev, s.monthly, s.total, s.done, s.remain
    ].map(v => String(v ?? '')).join(',');
    const csv = '\uFEFF' + headers.join(',') + '\n' + line;
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    const safeId = sanitizeFileName(String(row.id || 'بدون-كود'));
    a.download = `استبيان-${safeId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportFullSurveyToPDF = (row:any) => {
    if (!row) return;
    const s = ensureFullSurvey(row);

    const tasksRows = (s.tasks||[]).map((t:any)=>
      "<tr><td>"+(t.subject||'')+"</td><td>"+(t.durationDays||'')+"</td><td>"+(t.assignDate||'')+"</td><td>"+(t.doneDate||'—')+"</td><td>"+(t.remark||'')+"</td></tr>"
    ).join('') || '<tr><td colspan="5" style="text-align:center;color:#777;">لا توجد بيانات</td></tr>';

    const topicsRows = (s.topics||[]).map((t:any)=>
      "<tr><td>"+(t.number||'')+"</td><td>"+(t.summary||'')+"</td><td>"+(t.assignDate||'')+"</td><td>"+(t.actionDate||'—')+"</td><td>"+(t.actionType||'')+"</td></tr>"
    ).join('') || '<tr><td colspan="5" style="text-align:center;color:#777;">لا توجد بيانات</td></tr>';

    const remainingRows = (s.remainingTopics||[]).map((t:any)=>
      "<tr><td>"+(t.number||'')+"</td><td>"+(t.summary||'')+"</td><td>"+(t.assignDate||'')+"</td><td>"+(t.actionType||'')+"</td></tr>"
    ).join('') || '<tr><td colspan="4" style="text-align:center;color:#777;">لا توجد بيانات</td></tr>';

    const html =
'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/>'+
'<title>الإحصائية الشهرية</title>'+
'<style>@page{size:A4;margin:14mm;}body{font-family:"Times New Roman",serif;color:#2b2b2b;}h1{font-size:22pt;margin:10pt 0 4pt;text-align:center;font-weight:800;}h2{font-size:14pt;margin:16pt 0 6pt;color:#7A5A0A;}.subtitle{text-align:center;font-size:12.5pt;color:#333;margin:0 0 12pt;}.meta{color:#555;margin-bottom:10pt;}.kv{display:grid;grid-template-columns:140px 1fr;gap:6px 10px;margin-top:6pt;font-size:12pt;}.label{color:#444;font-weight:700;}.kv div{font-weight:600;color:#222;}table{width:100%;border-collapse:collapse;font-size:11pt;margin-top:6pt;}th,td{border:1px solid #ddd;padding:6px 8px;vertical-align:top;}thead th{background:#FFF7E6;color:#7A5A0A;}tbody tr:nth-child(even){background:#fafafa;}.box{border:1px solid #eee;padding:8px;background:#fcfcfc;}.doc-header{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:20px;white-space:nowrap;border-bottom:1px solid #e6e6e6;padding-bottom:12pt;margin-bottom:10pt;}.hdr-right{text-align:right;}.hdr-center{text-align:center;flex:1;line-height:1.3;}.hdr-left{text-align:left;}.hdr-title-ar{font-weight:900;font-size:20pt;}.hdr-title-en{font-size:12pt;color:#444;letter-spacing:0.3px;}.hdr-left .dept{font-weight:700;font-size:13pt;color:#333;}.logo{width:80px;height:80px;object-fit:contain;}.gold-divider{height:2px;background:linear-gradient(to left,#C9A63C,#E3C766,#F5E6B3,#E3C766,#C9A63C);margin-top:6pt;}</style>'+ 
'</head><body>'+
'<div class="doc-header">'+
  '<div class="hdr-right"><img class="logo" src="/logo.png" alt="Logo"/></div>'+
  '<div class="hdr-center"><div class="hdr-title-ar">هيئة الرقابة الإدارية</div><div class="hdr-title-en">Administrative Control Authority</div></div>'+
  '<div class="hdr-left"><div class="dept">مكتب التفتيش وتقييم الأداء</div></div>'+
'</div><div class="gold-divider"></div>'+
'<h1>الإحصائية الشهرية</h1>'+
'<h1>لأعمال ونشاط الأعضاء والموظفين الفنيين بفروع الهيئة<h1>'+
'<h2>البيانات الأساسية</h2>'+
'<div class="kv">'+
  '<div class="label">الاسم</div><div>'+(s.fullName||'—')+'</div>'+
  '<div class="label">الفرع</div><div>'+(s.branch||'—')+'</div>'+
  '<div class="label">الشهر/السنة</div><div>'+(s.cycle||'—')+'</div>'+
  '<div class="label">الصفة</div><div>'+(s.role||'—')+'</div>'+
  '<div class="label">الإدارة</div><div>'+(s.department||'—')+'</div>'+
  '<div class="label">المؤهل</div><div>'+(s.degree||'—')+'</div>'+
  '<div class="label">التخصص</div><div>'+(s.major||'—')+'</div>'+
'</div>'+
'<h2>أولا : اللجان المعروضة</h2>'+
'<table><thead><tr><th>المرحّل من الشهر السابق</th><th>الوارد الشهري</th><th>المجموع</th><th>المنجز</th><th>المتبقي</th></tr></thead>'+
'<tbody><tr><td>'+(s.prev||0)+'</td><td>'+(s.monthly||0)+'</td><td>'+(s.total||0)+'</td><td>'+(s.done||0)+'</td><td>'+(s.remain||0)+'</td></tr></tbody></table>'+
'<h2>كشف اللجان خلال الشهر</h2><table><thead><tr><th>موضوع التكليف</th><th>مدة التكليف</th><th>تاريخ التكليف</th><th>تاريخ الإنجاز</th><th>ملاحظات</th></tr></thead><tbody>'+tasksRows+'</tbody></table>'+
'<h2>ثانيا : الموضوعات المعروضة</h2><table><thead><tr><th>رقم الموضوع</th><th>ملخص الموضوع</th><th>تاريخ التكليف</th><th>تاريخ التصرف</th><th>نوع التصرف</th></tr></thead><tbody>'+topicsRows+'</tbody></table>'+
'<h2>ثالثا : الموضوعات المتبقية (غير المنجزة ) خلال الشهر </h2><table><thead><tr><th>رقم</th><th>ملخص</th><th>تاريخ التكليف</th><th>نوع التصرف</th></tr></thead><tbody>'+remainingRows+'</tbody></table>'+
(s.notes ? '<h2>ملاحظات</h2><div class="box">'+s.notes+'</div>' : '')+
((s.reasonsJustifications||s.challengesDifficulties)?'<h2>أسباب ومبررات عدم إنجاز الموضوعات</h2><div class="box">'+(s.reasonsJustifications||'—')+'</div><h2>المشاكل والصعوبات</h2><div class="box">'+(s.challengesDifficulties||'—')+'</div>':'')+
'<script>setTimeout(function(){window.print();},60);</script>'+
'</body></html>';

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error('no_iframe_doc');
      doc.open(); doc.write(html); doc.close();
      iframe.onload = () => {
        try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }
        finally { setTimeout(()=> document.body.removeChild(iframe), 500); }
      };
    } catch (e) {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      const safeId = sanitizeFileName(String(row.id || 'بدون-كود'));
      const fileName = 'استبيان-' + safeId + '.pdf.html';
      a.setAttribute('download', fileName);
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <GlassCard title={`كشف الاستبيانات — إدارة ${dept}`} subtitle="يعرض كل السجلات كاملة مع إمكانية فتح الاستبيان الكامل">
        <div className="rounded-2xl border border-black/10 bg-white/70 overflow-hidden max-w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[15px] table-fixed">
              <thead className="bg-[#FFF7E6] text-amber-800">
                <tr>
                  <th className="px-3 py-2 text-right">#</th>
                  <th className="px-3 py-2 text-right">الموظف</th>
                  <th className="px-3 py-2 text-right">الفرع</th>
                  <th className="px-3 py-2 text-right">الشهر</th>
                  <th className="px-3 py-2 text-right">إجمالي</th>
                  <th className="px-3 py-2 text-right">منجز</th>
                  <th className="px-3 py-2 text-right">متبقي</th>
                  <th className="px-3 py-2 text-right">التاريخ</th>
                  <th className="px-3 py-2 text-right">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {rows.map((r:any, i:number)=>(
                  <tr key={r.id} className="hover:bg-white">
                    <td className="px-3 py-2">{i+1}</td>
                    <td className="px-3 py-2">{r.employeeName}</td>
                    <td className="px-3 py-2">{r.branch}</td>
                    <td className="px-3 py-2">{r.cycle || '—'}</td>
                    
                    <td className="px-3 py-2">{r.topics?.total ?? 0}</td>
                    <td className="px-3 py-2">{r.topics?.done ?? 0}</td>
                    <td className="px-3 py-2">{r.topics?.remain ?? 0}</td>
                    <td className="px-3 py-2">{formatDate(r.submittedAt)}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={()=>openView(r)}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-[#FFF7E6] px-2.5 py-1.5 text-[13px] text-amber-800 hover:opacity-90"
                        title="عرض الاستبيان الكامل"
                      >
                        <Eye size={16}/> عرض
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length===0 && (
                  <tr>
                    <td colSpan={11} className="px-3 py-6 text-center text-neutral-600">لا توجد استبيانات لهذا التبويب.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>

      {/* Modal الاستبيان الكامل */}
      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 md:backdrop-blur-sm" onClick={closeView} />
          <div className="relative z-10 w-[min(960px,96vw)] max-h-[90vh] overflow-y-auto rounded-2xl border border-black/10 bg-white p-5 shadow-xl">
            <div className="sticky top-0 z-10 mb-3 flex items-center justify-between border-b border-black/10 bg-white/95 px-1 py-2">
              <div className="text-[15px] font-semibold" style={{color:'#2b2b2b'}}>
                عرض الاستبيان — <span className="text-amber-700">{selected.employeeName}</span> • {selected.cycle}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportFullSurveyToCSV(selected)}
                  className="rounded-lg border border-amber-300 bg-[#FFF7E6] px-3 py-1.5 text-[13px] text-amber-800 hover:opacity-90"
                  title="تصدير كل بيانات الاستبيان كـ CSV"
                >
                  تصدير CSV
                </button>
                <button
                  onClick={() => exportFullSurveyToPDF(selected)}
                  className="rounded-lg border border-amber-300 bg-[#FFF7E6] px-3 py-1.5 text-[13px] text-amber-800 hover:opacity-90"
                  title="تصدير كل بيانات الاستبيان كـ PDF"
                >
                  تصدير PDF
                </button>

                <button onClick={closeView} className="rounded-full p-2 hover:bg-black/5" title="إغلاق">
                  <IconX size={18}/>
                </button>
              </div>
            </div>

            <SurveyPreview
              survey={ (selected as any).survey ?? buildFullSurveyFromRow(selected) }
              managerNote={(selected as any).managerNote}
              branchManagerNote={(selected as any).branchManagerNote}
            />
          </div>
        </div>
      )}
    </>
  );
}

/* ==================== تبويبات شاشة فرع طرابلس ==================== */
const MONTHLY_TAB = '__MONTHLY__';
function BranchTabs({ surveysAll, activeBranch }:{surveysAll:any[]; activeBranch:any}) {
  const departments = useMemo(()=>{
    const set = new Set<string>();
    surveysAll.filter(s=> (s.branch||'')==='طرابلس')
      .forEach(s=> set.add(s.department || '—'));
    return Array.from(set).sort((a,b)=> a.localeCompare(b,'ar'));
  },[surveysAll]);

  const [activeTab, setActiveTab] = useState<string>(MONTHLY_TAB);

  return (
    <div className="space-y-4">
      {/* شريط التبويبات */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={()=>setActiveTab(MONTHLY_TAB)}
          className={twMerge(
            "rounded-xl border px-4 py-2 text-[15px] shadow-sm",
            activeTab===MONTHLY_TAB
              ? "bg-gradient-to-r from-[#F9F3E0] to-[#FFF7E6] border-amber-300 text-amber-800"
              : "bg-white/70 border-black/10 text-neutral-700 hover:bg-white"
          )}
        >
          الإحصائية الشهرية
        </button>
        {departments.map((d)=>(
          <button
            key={d}
            onClick={()=>setActiveTab(d)}
            className={twMerge(
              "rounded-xl border px-4 py-2 text-[15px] shadow-sm",
              activeTab===d
                ? "bg-gradient-to-r from-[#F9F3E0] to-[#FFF7E6] border-amber-300 text-amber-800"
                : "bg-white/70 border-black/10 text-neutral-700 hover:bg-white"
            )}
            title={`تفاصيل إدارة ${d}`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* محتوى التبويب */}
      {activeTab===MONTHLY_TAB ? (
        <TripoliMonthlyTab surveysAll={surveysAll} activeBranch={activeBranch}/>
      ) : (
        <DeptDetailTab surveysAll={surveysAll} dept={activeTab}/>
      )}
    </div>
  );
}

/* ==================== بيانات ديمو متعددة الفروع ==================== */
const BRANCHES = [
  { code: 'TRP', name: 'طرابلس',  enabled: true  },
  { code: 'BEN', name: 'بنغازي',  enabled: false },
  { code: 'MIS', name: 'مصراتة',  enabled: false },
  { code: 'SEB', name: 'سبها',    enabled: false },
];

function makeDemo() {
  const employees = ['أحمد علي','هدى محمد','محمد سعيد','ليلى علي','سالم عمران','منى الطيب','كمال علي'];
  const departments = [
    'الخدمية والأمنية','الموارد والطاقة','البنية الأساسية','المجالس البلدية','الشكاوى والبلاغات','المشروعات والدفعات'
  ];
  const cycles = ['2025-03','2025-04','2025-05','2025-06','2025-07','2025-08'];
  const pick = (arr: any[]) => arr[Math.floor(Math.random()*arr.length)];

  const surveysAll:any[] = [];
  for (let i=0;i<80;i++){
    const total  = 6 + Math.floor(Math.random()*12);
    const done   = Math.floor(total * (0.4 + Math.random()*0.5));
    const remain = Math.max(total - done, 0);
    const statuses = ['بانتظار التفتيش','مراجَع','مكتمل'];
    const status = pick(statuses);
    const branch = pick(BRANCHES).name;
    surveysAll.push({
      id: `S-${1000+i}`,
      employeeName: pick(employees),
      department: pick(departments),
      branch,
      cycle: pick(cycles),
      status,
      submittedAt: new Date(Date.now()-Math.random()*60*24*3600*1000).toISOString(),
      topics: { total, done, remain }
    });
  }

  const sheetAll = departments.map(dep=>{
    const prev    = 3 + Math.floor(Math.random()*10);
    const monthly = 10 + Math.floor(Math.random()*30);
    const total   = prev + monthly;
    const done    = Math.floor(total * (0.55 + Math.random()*0.35));
    const remain  = Math.max(total-done,0);
    return { department: dep, prev, monthly, total, done, remain, notes: '' };
  });

  const statsAll = employees.map(emp=>{
    const prev    = Math.floor(Math.random()*5);
    const monthly = 4 + Math.floor(Math.random()*8);
    const total   = prev + monthly;
    const done    = Math.floor(total * (0.5 + Math.random()*0.4));
    const remain  = Math.max(total-done,0);
    return {
      employee: emp,
      dept: pick(departments),
      branch: pick(BRANCHES).name,
      prev, monthly, total, done, remain, note: ''
    };
  });

  const byBranch:any = {};
  surveysAll.forEach(s=>{
    if(!byBranch[s.branch]) byBranch[s.branch] = { total:0, done:0, remain:0 };
    byBranch[s.branch].total  += s.topics.total;
    byBranch[s.branch].done   += s.topics.done;
    byBranch[s.branch].remain += s.topics.remain;
  });
  const branchObjects = BRANCHES.map(b=>{
    const m = byBranch[b.name] || { total:0, done:0, remain:0 };
    const spark = Array.from({length:8},()=> 10+Math.floor(Math.random()*40));
    return { ...b, metrics: m, spark };
  });

  return { surveysAll, sheetAll, statsAll, branchObjects };
}

/* ==================== الصفحة الرئيسية للتفتيش ==================== */
export default function InspectionPage() {
  const [lang, setLang] = useState<'ar'|'en'>('ar');

  // منع Hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); }, []);

  const [{ surveysAll, sheetAll, statsAll, branchObjects }, setData] = useState(makeDemo());
  const [mode, setMode] = useState<'dashboard'|'branch'>('dashboard');
  const [activeBranch, setActiveBranch] = useState<any>(null);

  useEffect(()=>{
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  },[lang]);

  const enterBranch = (b:any) => {
    setActiveBranch(b);
    setMode('branch');
    if (typeof window !== 'undefined') {
      setTimeout(()=> window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  };

  const leaveBranch = () => {
    setActiveBranch(null);
    setMode('dashboard');
    if (typeof window !== 'undefined') {
      setTimeout(()=> window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-aca-beige text-aca-gray text-[15px] sm:text-[16px] overflow-x-hidden">
      {/* خلفية فاخرة (حركة بطيئة فقط من md وفوق) */}
      <div className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden">
        <div
          className="bg-layer absolute inset-0 opacity-60 md:animate-[spin_90s_linear_infinite]"
          style={{ background: 'conic-gradient(at 100% 0%, #FFFDF8, #F7F2E6, #F4EDDF, #FFFDF8)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 200px at 0% 0%, rgba(201,162,63,0.12), transparent), radial-gradient(600px 200px at 100% 100%, rgba(201,162,63,0.10), transparent)'
          }}
        />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_24px_24px,rgba(0,0,0,0.5)_1.2px,transparent_1.2px)] [background-size:32px_32px]" />
      </div>

      {/* هيدر */}
      <header className="relative z-10 border-b border-black/5 bg-white/60 md:backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 sm:px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={44} height={44} className="rounded-md shadow" />
            <div>
              <div className={`${diwani.className} text-[22px] sm:text-2xl bg-gradient-to-r from-[#AD8F2F] via-[#D1B659] to-[#F0E2A2] bg-clip-text text-transparent [background-size:200%_100%] md:animate-goldSheen`}>
                 هيئة الرقابة الإدارية — مكتب التفتيش وتقييم الأداء
              </div>
            </div>
          </div>

         
        </div>
      </header>

      {/* المحتوى */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-3 sm:px-4 py-6">
        {mode === 'dashboard' ? (
          <>
            <div className="mb-5 flex items-center justify-between" />
            <SuperDashboard
              surveysAll={surveysAll}
              sheetAll={sheetAll}
              statsAll={statsAll}
              branches={BRANCHES}
            />
            <div className="mt-6">
              <BranchGrid branches={branchObjects} onEnter={enterBranch}/>
            </div>
          </>
        ) : (
          <>
            {/* شاشة الفرع (طرابلس فقط) */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1
                  className={`${diwani.className}
                    text-3xl sm:text-4xl md:text-4xl font-bold tracking-wide
                    bg-gradient-to-r from-[#F5E6B3] via-[#E3C766] to-[#C9A63C]
                    bg-clip-text text-transparent
                    [background-size:100%_100%] sm:[background-size:200%_100%]
                    md:animate-goldSheen drop-shadow-md`}
                >
                  فرع {activeBranch?.name}
                </h1>
              </div>

              <button
                onClick={leaveBranch}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[15px] font-semibold 
                          shadow-md transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(to right, #F5E6B3, #E3C766, #C9A63C)',
                  borderColor: 'rgba(184,134,11,0.35)',
                  color: '#3a2e00',
                }}
              >
                <ArrowRight size={16} className="text-[#3a2e00]" />
                رجوع للصفحة الرئيسية
              </button>
            </div>

            {/* تبويبات الإحصائية الشهرية + الإدارات */}
            <div className="mt-6">
              <BranchTabs surveysAll={surveysAll} activeBranch={activeBranch}/>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
