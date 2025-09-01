'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useForm, FormProvider, useFieldArray, useWatch,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Toaster, toast } from 'sonner';
import {
  ChevronLeft, ChevronRight, Building2, Briefcase, GraduationCap, FileText, Calendar,
  CheckCircle2, ShieldCheck, Calculator, AlertTriangle, User2, PlayCircle
} from 'lucide-react';

/* ===== خط العنوان (عدّل المسار إذا لزم) ===== */
const diwani = localFont({
  src: '../../public/fonts/Diwani.ttf',
  display: 'swap',
});

/* ===== ثابتات (placeholder حتى ربط الـ API) ===== */
const BRANCHES = ['طرابلس','بنغازي','زليتن','سبها','البيضاء','درنة','الخمس','غريان','زوارة'];
const DEPARTMENTS = [
  'إدارة الرقابة على القطاعات الخدمية والأمنية',
  'إدارة الرقابة على المجالس البلدية والجهات التابعة لها',
  'إدارة الرقابة على قطاعات الموارد الاقتصادية والطاقة',
  'إدارة الرقابة على قطاعات البنية الأساسية',
  'وحدة الشكاوى والبلاغات',
  'وحدة الرقابة على المشروعات ومراجعة الدفعات'
];
const DEGREES = ['ثانوي','دبلوم','بكالوريوس','ماجستير','دكتوراه'];

/* ===== Schemas ===== */
const taskItem = z.object({
  subject: z.string().min(2, 'أدخل موضوع التكليف'),
  durationDays: z.coerce.number().min(0, 'مدة غير صحيحة'),
  assignDate: z.string().min(1, 'حدد تاريخ التكليف'),
  doneDate: z.string().optional(),
  remark: z.string().optional(),
});

const topicItem = z.object({
  number: z.string().min(1, 'أدخل رقم الموضوع'),
  summary: z.string().min(2, 'أدخل ملخص الموضوع'),
  assignDate: z.string().min(1, 'حدد تاريخ التكليف'),
  actionDate: z.string().optional(),
  actionType: z.string().min(1, 'أدخل نوع التصرف'),
});

const remainingTopicItem = z.object({
  number: z.string().min(1, 'أدخل رقم الموضوع'),
  summary: z.string().min(2, 'أدخل ملخص الموضوع'),
  assignDate: z.string().min(1, 'حدد تاريخ التكليف'),
  actionType: z.string().min(1, 'أدخل نوع التصرف'),
});

/* ✅ بدون خانة ردّ الموظف */
const schema = z.object({
  branch: z.string().min(1, 'اختر الفرع'),
  fullName: z.string().min(3, 'أدخل الاسم الكامل').max(120),
  cycle: z.string().min(1, 'اختر شهر/سنة الاستبيان'),
  role: z.enum(['عضو', 'موظف فني'], { required_error: 'اختر الوظيفة' }),
  department: z.string().min(1, 'اختر الإدارة'),
  degree: z.string().min(1, 'اختر المؤهل العلمي'),
  major: z.string().min(2, 'أدخل التخصص'),

  // اللجان
  prev: z.coerce.number().min(0).default(0),
  monthly: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0).default(0),
  done: z.coerce.number().min(0).default(0),
  remain: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  tasks: z.array(taskItem).default([]),

  // الموضوعات المعروضة
  topicsPrev: z.coerce.number().min(0).default(0),
  topicsMonthly: z.coerce.number().min(0).default(0),
  topicsTotal: z.coerce.number().min(0).default(0),
  topicsDone: z.coerce.number().min(0).default(0),
  topicsRemain: z.coerce.number().min(0).default(0),
  topicsNotes: z.string().optional(),
  topics: z.array(topicItem).default([]),

  // المتبقي + الأسباب
  remainingTopics: z.array(remainingTopicItem).default([]),
  reasonsJustifications: z.string().optional(),
  challengesDifficulties: z.string().optional(),
});

/* ===== الخطوات ===== */
const STEPS = [
  { key: 'step1', title: 'الفرع والاسم والشهر/السنة', icon: Building2 },
  { key: 'step2', title: 'الوظيفة والإدارة', icon: Briefcase },
  { key: 'step3', title: 'المؤهل والتخصص', icon: GraduationCap },
  { key: 'step4', title: 'اللجان المعروضة', icon: Calculator },
  { key: 'step5', title: 'الموضوعات المعروضة', icon: Calculator },
  { key: 'step6', title: 'المتبقي + أسباب عدم الإنجاز', icon: Calculator },
  { key: 'step7', title: 'المراجعة النهائية', icon: Calendar },
];

/* ===== أنيميشن ===== */
const motionVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: .45 } },
  exit: { opacity: 0, y: -12, transition: { duration: .3 } }
};

/* ===== Utils ===== */
function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-600">{error.message}</p>;
}
function FormSection({ title, children }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-aca-gray">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, error, children }) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm text-neutral-600">{label}</label>}
      {children}
      <FieldError error={error} />
    </div>
  );
}
const inputBase = 'w-full rounded-lg border bg-white/85 px-3 py-2 text-sm outline-none focus:ring-2';
function NumberField({ registerOptions, name, register, error, readOnly=false, min=0 }) {
  return (
    <>
      <input
        type="number"
        min={min}
        readOnly={readOnly}
        className={twMerge(
          inputBase,
          readOnly ? 'bg-gray-100 border-neutral-200' :
          error ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
        )}
        {...register(name, registerOptions)}
      />
      <FieldError error={error} />
    </>
  );
}
function TextareaField({ name, register, error, rows=3, placeholder='' }) {
  return (
    <>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className={twMerge(
          inputBase,
          'min-h-[96px]',
          error ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
        )}
        {...register(name)}
      />
      <FieldError error={error} />
    </>
  );
}
function CommitteesArray({ fields, register, remove, append }) {
  return (
    <div className="mt-6 rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur text-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-aca-gray">كشف اللجان خلال الشهر</h3>
        <button
          type="button"
          onClick={() => append({ subject: '', durationDays: 0, assignDate: '', doneDate: '', remark: '' })}
          className="rounded-lg bg-aca-gray px-3 py-1.5 text-white hover:opacity-95"
        >
          إضافة لجنة
        </button>
      </div>

      {fields.length === 0 && <p className="text-neutral-600 text-sm">لا توجد لجان مضافة بعد.</p>}

      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div key={field.id} className="rounded-lg border border-black/10 bg-white/80 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-neutral-600">موضوع التكليف</label>
                <input type="text" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`tasks.${idx}.subject`)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-600">مدة التكليف</label>
                <input type="number" min="0" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`tasks.${idx}.durationDays`, { valueAsNumber: true })} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-600">تاريخ التكليف</label>
                <input type="date" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`tasks.${idx}.assignDate`)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-600">تاريخ الإنجاز (اختياري)</label>
                <input type="date" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`tasks.${idx}.doneDate`)} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <label className="mb-1 block text-xs text-neutral-600">ملاحظات</label>
                <input type="text" placeholder="أي تفاصيل إضافية..." className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`tasks.${idx}.remark`)} />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => remove(idx)}
                  className="h-[38px] rounded-lg border border-black/10 bg-white/80 px-3 text-sm text-aca-gray hover:bg-white">
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function TopicsArray({ topicFields, register, removeTopic, appendTopic }) {
  return (
    <div className="mt-6 rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur text-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-aca-gray">الموضوعات المعروضة خلال الشهر</h3>
        <button type="button" onClick={() => appendTopic({ number: '', summary: '', assignDate: '', actionDate: '', actionType: '' })}
          className="rounded-lg bg-aca-gray px-3 py-1.5 text-white hover:opacity-95">
          إضافة موضوع
        </button>
      </div>

      {topicFields.length === 0 && <p className="text-neutral-600 text-sm">لا توجد موضوعات مضافة بعد.</p>}

      <div className="space-y-4">
        {topicFields.map((field, idx) => (
          <div key={field.id} className="rounded-lg border border-black/10 bg-white/80 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs text-neutral-600">رقم الموضوع</label>
                <input type="text" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`topics.${idx}.number`)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-neutral-600">ملخص الموضوع</label>
                <input type="text" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`topics.${idx}.summary`)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-600">تاريخ التكليف</label>
                <input type="date" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`topics.${idx}.assignDate`)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-600">تاريخ التصرف</label>
                <input type="date" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`topics.${idx}.actionDate`)} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <label className="mb-1 block text-xs text-neutral-600">نوع التصرف</label>
                <input type="text" placeholder="مثال: إحالة، أرشفة، متابعة..." className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`topics.${idx}.actionType`)} />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => removeTopic(idx)}
                  className="h-[38px] rounded-lg border border-black/10 bg-white/80 px-3 text-sm text-aca-gray hover:bg-white">
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function RemainingArray({ remainingFields, register, removeRemaining, appendRemaining }) {
  return (
    <div className="mt-6 rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur text-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-aca-gray">الموضوعات المتبقية (غير المنجزة) خلال الشهر</h3>
        <button type="button" onClick={() => appendRemaining({ number: '', summary: '', assignDate: '', actionType: '' })}
          className="rounded-lg bg-aca-gray px-3 py-1.5 text-white hover:opacity-95">
          إضافة موضوع متبقٍ
        </button>
      </div>

      {remainingFields.length === 0 && <p className="text-neutral-600 text-sm">لا توجد موضوعات متبقية مُضافة بعد.</p>}

      <div className="space-y-4">
        {remainingFields.map((field, idx) => (
          <div key={field.id} className="rounded-lg border border-black/10 bg-white/80 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs text-neutral-600">رقم الموضوع</label>
                <input type="text" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`remainingTopics.${idx}.number`)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-neutral-600">ملخص الموضوع</label>
                <input type="text" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`remainingTopics.${idx}.summary`)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-600">تاريخ التكليف</label>
                <input type="date" className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`remainingTopics.${idx}.assignDate`)} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <label className="mb-1 block text-xs text-neutral-600">نوع التصرف</label>
                <input type="text" placeholder="مثال: إحالة، متابعة..." className={twMerge(inputBase, 'border-neutral-200 focus:ring-aca-gold')}
                  {...register(`remainingTopics.${idx}.actionType`)} />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => removeRemaining(idx)}
                  className="h-[38px] rounded-lg border border-black/10 bg-white/80 px-3 text-sm text-aca-gray hover:bg-white">
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function StepIcons({ current }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const active = i === current;
        const done = i < current;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div className={twMerge(
              'flex h-8 w-8 items-center justify-center rounded-full border text-xs',
              active && 'border-aca-gold bg-aca-gold/20 text-aca-gray',
              done && 'border-aca-green bg-aca-green/20 text-aca-gray',
              !active && !done && 'border-black/15 bg-white/70 text-neutral-500'
            )}>
              <Icon size={16} />
            </div>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-black/10" />}
          </div>
        );
      })}
    </div>
  );
}
function ProgressBar({ current }) {
  const percent = useMemo(() => ((current + 1) / STEPS.length) * 100, [current]);
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs text-neutral-600">
        <span>الخطوة {current + 1} من {STEPS.length}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
        <div className="h-full bg-gradient-to-r from-aca-green via-aca-gold to-aca-red" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/* UTC ثابت لتفادي Hydration mismatch */
function formatUtc(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth()+1).padStart(2,'0');
  const dd = String(d.getUTCDate()).padStart(2,'0');
  const hh = String(d.getUTCHours()).padStart(2,'0');
  const mi = String(d.getUTCMinutes()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi} UTC`;
}

/* ======== Mock: “قاعدة بيانات” الموظف المحلية ======== */
async function fetchEmployeeProfile() {
  try {
    const raw = localStorage.getItem('employee_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function applyProfileToForm(prof, setValue) {
  if (!prof) return;
  if (prof.fullName)   setValue('fullName', prof.fullName);
  if (prof.branch)     setValue('branch', prof.branch);
  if (prof.role)       setValue('role', prof.role);
  if (prof.department) setValue('department', prof.department);
  if (prof.degree)     setValue('degree', prof.degree);
  if (prof.major)      setValue('major', prof.major);
  // دورة الاستبيان: شهر/سنة اليوم إذا فارغة
  const now = new Date();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const y = now.getFullYear();
  setValue('cycle', `${y}-${m}`);
}

/* ======== صفحة الموظف ======== */
export default function EmployeeSurveyPage() {
  const [lang, setLang] = useState('ar');
  const [current, setCurrent] = useState(0);

  // شاشة البداية (قبل فتح النموذج)
  const [showForm, setShowForm] = useState(false);

  // إشعار إرجاع من الأمين الإداري فقط
  const [returnInfo, setReturnInfo] = useState(null);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // قراءة إشعار الإرجاع (يضعه الأمين عند الإرجاع)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('employee_return_info');
      if (raw) {
        const info = JSON.parse(raw);
        if (info?.by === 'secretary') setReturnInfo(info);
      }
    } catch {}
  }, []);

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      branch: '',
      fullName: '',
      cycle: '',
      role: undefined,
      department: '',
      degree: '',
      major: '',
      // اللجان
      prev: 0, monthly: 0, total: 0, done: 0, remain: 0, notes: '', tasks: [],
      // الموضوعات المعروضة
      topicsPrev: 0, topicsMonthly: 0, topicsTotal: 0, topicsDone: 0, topicsRemain: 0, topicsNotes: '', topics: [],
      // المتبقي + الأسباب
      remainingTopics: [], reasonsJustifications: '', challengesDifficulties: '',
    },
  });

  const {
    handleSubmit, trigger, formState: { errors }, watch, register, setValue, control
  } = methods;

  // تعبئة تلقائية عند فتح الصفحة من “الملف الوظيفي” + استرجاع مسودة
  useEffect(() => {
    (async () => {
      const prof = await fetchEmployeeProfile();
      if (prof) applyProfileToForm(prof, setValue);
    })();
    try {
      const draftRaw = localStorage.getItem('surveyDraft');
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        Object.entries(draft).forEach(([k, v]) => setValue(k, v));
      }
    } catch {}
  }, [setValue]);

  // كشف اللجان (ديناميكي)
  const { fields, append, remove } = useFieldArray({ control, name: 'tasks' });
  // الموضوعات المعروضة (ديناميكي)
  const { fields: topicFields, append: appendTopic, remove: removeTopic } = useFieldArray({ control, name: 'topics' });
  // الموضوعات المتبقية (ديناميكي)
  const { fields: remainingFields, append: appendRemaining, remove: removeRemaining } = useFieldArray({ control, name: 'remainingTopics' });

  // جمع/متبقي (لجان)
  const [prevVal, monthlyVal, doneVal] = useWatch({
    control, name: ['prev', 'monthly', 'done'], defaultValue: [0, 0, 0]
  });
  useEffect(() => {
    const total = Number(prevVal || 0) + Number(monthlyVal || 0);
    const remain = Math.max(total - Number(doneVal || 0), 0);
    setValue('total', total, { shouldValidate: true, shouldDirty: true });
    setValue('remain', remain, { shouldValidate: true, shouldDirty: true });
  }, [prevVal, monthlyVal, doneVal, setValue]);

  // جمع/متبقي (موضوعات)
  const [topicsPrevVal, topicsMonthlyVal, topicsDoneVal] = useWatch({
    control, name: ['topicsPrev', 'topicsMonthly', 'topicsDone'], defaultValue: [0, 0, 0],
  });
  useEffect(() => {
    const total = Number(topicsPrevVal || 0) + Number(topicsMonthlyVal || 0);
    const remain = Math.max(total - Number(topicsDoneVal || 0), 0);
    setValue('topicsTotal', total, { shouldValidate: true, shouldDirty: true });
    setValue('topicsRemain', remain, { shouldValidate: true, shouldDirty: true });
  }, [topicsPrevVal, topicsMonthlyVal, topicsDoneVal, setValue]);

  // حفظ تلقائي (Debounce)
  useEffect(() => {
    let t;
    const sub = methods.watch((values) => {
      clearTimeout(t);
      t = setTimeout(() => {
        localStorage.setItem('surveyDraft', JSON.stringify(values));
      }, 600);
    });
    return () => { clearTimeout(t); sub.unsubscribe(); };
  }, [methods]);

  const fieldsPerStep = {
    0: ['branch', 'fullName', 'cycle'],
    1: ['role', 'department'],
    2: ['degree', 'major'],
    3: ['prev', 'monthly', 'done', 'notes', 'tasks'],
    4: ['topicsPrev', 'topicsMonthly', 'topicsDone', 'topicsNotes', 'topics'],
    5: ['remainingTopics', 'reasonsJustifications', 'challengesDifficulties'],
    6: [], // مراجعة فقط
  };

  const nextStep = async () => {
    const ok = await trigger(fieldsPerStep[current] || []);
    if (!ok) return;
    if (current < STEPS.length - 1) {
      setCurrent((c) => c + 1);
      // اختياري: سكرول للأعلى
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    }
  };

  const prevStep = () => {
    setCurrent((c) => Math.max(0, c - 1));
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  };

  // الإرسال الحقيقي (فقط في آخر خطوة)
  const onSubmit = async (values) => {
    if (current !== STEPS.length - 1) return;

    toast.loading('جاري الإرسال…', { id: 'send' });
    try {
      // TODO: call your API here
      await new Promise((r) => setTimeout(r, 900));
      localStorage.setItem('surveyDraft', JSON.stringify(values));
      try { localStorage.removeItem('employee_return_info'); setReturnInfo(null); } catch {}
      toast.success('تم الإرسال بنجاح', { id: 'send' });
    } catch {
      toast.error('تعذر الإرسال، حاول مجددًا', { id: 'send' });
    }
  };

  /* ===== شارة حالة الاستبيان للموظف (اثنان فقط) ===== */
  function EmployeeStatusBadge({ status }: { status: 'awaiting_employee' | 'returned_by_secretary' | string }) {
    const map: any = {
      awaiting_employee:     { label: 'بانتظار تعبئة الاستبيان', dot: 'bg-yellow-400', text: 'text-yellow-800', bg: 'bg-yellow-50' },
      returned_by_secretary: { label: 'مُرجعة من الأمين الإداري', dot: 'bg-red-500',    text: 'text-red-800',    bg: 'bg-red-50' },
    };
    const s = map[status] || map.awaiting_employee;
    return (
      <span className={twMerge('inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium', s.bg, s.text)}>
        <span className={twMerge('h-2.5 w-2.5 rounded-full', s.dot)} />
        {s.label}
      </span>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="relative min-h-screen bg-aca-beige text-aca-gray">
        {/* خلفية */}
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
                <div className="text-xs text-neutral-600">المنظومة المؤسسية للاستبيانات الشهرية</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="hidden sm:flex items-center gap-2 text-aca-gray">
                <ShieldCheck size={16} className="opacity-80" />
                <span>اتصال آمن</span>
              </div>
              <div className="h-6 w-px bg-black/10" />
              <button
                onClick={() => setLang((v) => v === 'ar' ? 'en' : 'ar')}
                className="rounded-md border border-black/10 bg-white/70 px-3 py-1 hover:bg-white"
              >
                {lang === 'ar' ? 'EN' : 'عربي'}
              </button>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8">
          {/* شريط أعلى — حالة فقط */}
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
            <User2 size={16} className="text-neutral-600" />
            <span className="text-neutral-700">وضع الاستبيان الحالي:</span>
            <EmployeeStatusBadge status={returnInfo ? 'returned_by_secretary' : 'awaiting_employee'} />
          </div>

          {/* تنبيه إرجاع إن وُجد */}
          {returnInfo && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-900">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <AlertTriangle size={16} />
                <span>تم إرجاع الاستبيان للمراجعة</span>
              </div>
              <div className="leading-6">
                <div>الجهة: <strong>الأمين الإداري</strong></div>
                {returnInfo.cycle && <div>الدورة: <strong>{returnInfo.cycle}</strong></div>}
                {returnInfo.at && <div>التاريخ: <strong suppressHydrationWarning>{formatUtc(returnInfo.at)}</strong></div>}
                <div className="mt-1">السبب: <strong className="whitespace-pre-wrap">{returnInfo.note || '-'}</strong></div>
              </div>
            </div>
          )}

          {/* شاشة البداية قبل الاستبيان */}
          {!showForm && (
            <div className="grid place-items-center py-10">
              <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white/70 p-8 text-center shadow backdrop-blur">
                <div className="mb-2 text-sm text-neutral-600">مرحبًا بك</div>
                <div className="mb-4 text-xl font-semibold text-aca-gray">الاستبيان الشهري</div>
                <p className="mx-auto mb-6 max-w-md text-sm text-neutral-700">
                  اضغط على “ابدأ الاستبيان” لفتح النموذج. سيتم تعبئة بياناتك الوظيفية تلقائيًا (الاسم، الفرع، الوظيفة، الإدارة، المؤهل، التخصص، شهر/سنة الاستبيان).
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-aca-gray px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95"
                >
                  <PlayCircle size={16} />
                  ابدأ الاستبيان
                </button>
              </div>
            </div>
          )}

          {/* نموذج الاستبيان */}
          {showForm && (
            <>
              <ProgressBar current={current} />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,.9fr]">
                {/* اليسار */}
                <section>
                  <div
                    role="form"
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        current !== STEPS.length - 1 &&
                        (e.target as HTMLElement)?.tagName !== 'TEXTAREA'
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="group relative rounded-2xl p-[2px] bg-gradient-to-br from-[#6B8E23] via-[#C9A23F] to-[#4B6F3E] shadow-[0_28px_80px_-26px_rgba(0,0,0,0.35)]"
                  >
                    <div className="rounded-2xl border border-black/10 bg-white/70 p-6 backdrop-blur-xl">
                      <StepIcons current={current} />

                      <AnimatePresence mode="wait">
                        {/* STEP 1 */}
                        {current === 0 && (
                          <motion.div key="s1" variants={motionVariants} initial="hidden" animate="show" exit="exit">
                            <FormSection title="الفرع والاسم والشهر/السنة">
                              <Field label="من أي فرع؟" error={errors.branch}>
                                <select
                                  className={twMerge(
                                    inputBase,
                                    errors.branch ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
                                  )}
                                  {...register('branch')}
                                >
                                  <option value="">اختر الفرع</option>
                                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                                </select>
                              </Field>

                              <Field label="الاسم الكامل" error={errors.fullName}>
                                <input
                                  type="text"
                                  placeholder="أدخل الاسم"
                                  className={twMerge(
                                    inputBase,
                                    errors.fullName ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
                                  )}
                                  {...register('fullName')}
                                />
                              </Field>

                              <Field label="شهر وسنة الاستبيان" error={errors.cycle}>
                                <input
                                  type="month"
                                  className={twMerge(
                                    inputBase,
                                    errors.cycle ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
                                  )}
                                  {...register('cycle')}
                                />
                              </Field>
                            </FormSection>
                          </motion.div>
                        )}

                        {/* STEP 2 */}
                        {current === 1 && (
                          <motion.div key="s2" variants={motionVariants} initial="hidden" animate="show" exit="exit">
                            <FormSection title="الوظيفة والإدارة">
                              <Field label="الوظيفة" error={errors.role}>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  {['عضو', 'موظف فني'].map((r) => (
                                    <label key={r} className={twMerge(
                                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2',
                                      watch('role') === r ? 'border-aca-gold bg-aca-gold/15' : 'border-neutral-200 bg-white/70'
                                    )}>
                                      <input type="radio" className="accent-aca-gold" value={r} {...register('role')} />
                                      {r}
                                    </label>
                                  ))}
                                </div>
                              </Field>

                              <Field label="الإدارة التابعة لها" error={errors.department}>
                                <select
                                  className={twMerge(
                                    inputBase,
                                    errors.department ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
                                  )}
                                  {...register('department')}
                                >
                                  <option value="">اختر الإدارة</option>
                                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </Field>
                            </FormSection>
                          </motion.div>
                        )}

                        {/* STEP 3 */}
                        {current === 2 && (
                          <motion.div key="s3" variants={motionVariants} initial="hidden" animate="show" exit="exit">
                            <FormSection title="المؤهل والتخصص">
                              <Field label="المؤهل العلمي" error={errors.degree}>
                                <select
                                  className={twMerge(
                                    inputBase,
                                    errors.degree ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
                                  )}
                                  {...register('degree')}
                                >
                                  <option value="">اختر المؤهل</option>
                                  {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </Field>

                              <Field label="التخصص" error={errors.major}>
                                <input
                                  type="text"
                                  placeholder="مثال: قانون / محاسبة / تقنية معلومات"
                                  className={twMerge(
                                    inputBase,
                                    errors.major ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
                                  )}
                                  {...register('major')}
                                />
                              </Field>
                            </FormSection>
                          </motion.div>
                        )}

                        {/* STEP 4 - اللجان */}
                        {current === 3 && (
                          <motion.div key="s4" variants={motionVariants} initial="hidden" animate="show" exit="exit">
                            <FormSection title="اللجان المعروضة">
                              <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur text-sm">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                  <Field label="المرحّل من الشهر السابق" error={errors.prev}>
                                    <NumberField name="prev" register={register} registerOptions={{ valueAsNumber: true, min: 0 }} error={errors.prev} />
                                  </Field>
                                  <Field label="الوارد الشهري" error={errors.monthly}>
                                    <NumberField name="monthly" register={register} registerOptions={{ valueAsNumber: true, min: 0 }} error={errors.monthly} />
                                  </Field>
                                  <Field label="المجموع" error={errors.total}>
                                    <NumberField name="total" register={register} readOnly error={errors.total} />
                                  </Field>
                                  <Field label="المنجز خلال الشهر" error={errors.done}>
                                    <NumberField name="done" register={register} registerOptions={{ valueAsNumber: true, min: 0 }} error={errors.done} />
                                  </Field>
                                  <Field label="المتبقي نهاية الشهر" error={errors.remain}>
                                    <NumberField name="remain" register={register} readOnly error={errors.remain} />
                                  </Field>
                                </div>
                                <div className="mt-4">
                                  <label className="mb-1 block text-sm text-neutral-600">ملاحظات</label>
                                  <TextareaField name="notes" register={register} error={errors.notes} placeholder="اكتب أي ملاحظات إضافية..." />
                                </div>
                              </div>

                              <CommitteesArray fields={fields} register={register} remove={remove} append={append} />
                            </FormSection>
                          </motion.div>
                        )}

                        {/* STEP 5 - الموضوعات */}
                        {current === 4 && (
                          <motion.div key="s5-topics" variants={motionVariants} initial="hidden" animate="show" exit="exit">
                            <FormSection title="الموضوعات المعروضة">
                              <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur text-sm">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                  <Field label="المرحّل من الشهر السابق" error={errors.topicsPrev}>
                                    <NumberField name="topicsPrev" register={register} registerOptions={{ valueAsNumber: true, min: 0 }} error={errors.topicsPrev} />
                                  </Field>
                                  <Field label="الوارد الشهري" error={errors.topicsMonthly}>
                                    <NumberField name="topicsMonthly" register={register} registerOptions={{ valueAsNumber: true, min: 0 }} error={errors.topicsMonthly} />
                                  </Field>
                                  <Field label="المجموع" error={errors.topicsTotal}>
                                    <NumberField name="topicsTotal" register={register} readOnly error={errors.topicsTotal} />
                                  </Field>
                                  <Field label="المنجز خلال الشهر" error={errors.topicsDone}>
                                    <NumberField name="topicsDone" register={register} registerOptions={{ valueAsNumber: true, min: 0 }} error={errors.topicsDone} />
                                  </Field>
                                  <Field label="المتبقي نهاية الشهر" error={errors.topicsRemain}>
                                    <NumberField name="topicsRemain" register={register} readOnly error={errors.topicsRemain} />
                                  </Field>
                                </div>
                                <div className="mt-4">
                                  <label className="mb-1 block text-sm text-neutral-600">ملاحظات</label>
                                  <TextareaField name="topicsNotes" register={register} error={errors.topicsNotes} placeholder="اكتب أي ملاحظات بخصوص الموضوعات المعروضة..." />
                                </div>
                              </div>

                              <TopicsArray topicFields={topicFields} register={register} removeTopic={removeTopic} appendTopic={appendTopic} />
                            </FormSection>
                          </motion.div>
                        )}

                        {/* STEP 6 - المتبقي + أسباب */}
                        {current === 5 && (
                          <motion.div key="s6-remain" variants={motionVariants} initial="hidden" animate="show" exit="exit">
                            <FormSection title="الموضوعات المتبقية (غير المنجزة) خلال الشهر">
                              <RemainingArray remainingFields={remainingFields} register={register} removeRemaining={removeRemaining} appendRemaining={appendRemaining} />
                              <div className="mt-6 grid grid-cols-1 gap-6">
                                <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur text-sm">
                                  <h3 className="mb-3 font-semibold text-aca-gray">أسباب ومبررات عدم إنجاز الموضوعات</h3>
                                  <TextareaField name="reasonsJustifications" register={register} error={errors.reasonsJustifications} rows={4} placeholder="مثال: نقص مستندات، انتظار رد جهة، تغيّر نطاق الموضوع..." />
                                </div>
                                <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur text-sm">
                                  <h3 className="mb-3 font-semibold text-aca-gray">المشاكل والصعوبات خلال الشهر</h3>
                                  <TextareaField name="challengesDifficulties" register={register} error={errors.challengesDifficulties} rows={4} placeholder="مثال: ضغط عمل، نقص كوادر، أعطال فنية..." />
                                </div>
                              </div>
                            </FormSection>
                          </motion.div>
                        )}

                        {/* STEP 7 - مراجعة نهائية */}
                        {current === 6 && (
                          <motion.div key="s7" variants={motionVariants} initial="hidden" animate="show" exit="exit">
                            <FormSection title="المراجعة النهائية">
                              <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-sm text-aca-gray">
                                <div className="mb-2 font-semibold">مراجعة البيانات</div>
                                <ul className="space-y-1">
                                  <li>الفرع: <strong>{watch('branch') || '-'}</strong></li>
                                  <li>الاسم: <strong>{watch('fullName') || '-'}</strong></li>
                                  <li>الشهر/السنة: <strong>{watch('cycle') || '-'}</strong></li>
                                  <li>الوظيفة: <strong>{watch('role') || '-'}</strong></li>
                                  <li>الإدارة: <strong>{watch('department') || '-'}</strong></li>
                                  <li>المؤهل: <strong>{watch('degree') || '-'}</strong></li>
                                  <li>التخصص: <strong>{watch('major') || '-'}</strong></li>

                                  <li className="mt-2 font-semibold">ملخص اللجان</li>
                                  <li>المجموع: <strong>{watch('total') ?? 0}</strong></li>
                                  <li>المنجز: <strong>{watch('done') ?? 0}</strong></li>
                                  <li>المتبقي: <strong>{watch('remain') ?? 0}</strong></li>
                                  <li>عدد اللجان المضافة: <strong>{watch('tasks')?.length ?? 0}</strong></li>

                                  <li className="mt-2 font-semibold">ملخص الموضوعات المعروضة</li>
                                  <li>المجموع: <strong>{watch('topicsTotal') ?? 0}</strong></li>
                                  <li>المنجز: <strong>{watch('topicsDone') ?? 0}</strong></li>
                                  <li>المتبقي: <strong>{watch('topicsRemain') ?? 0}</strong></li>
                                  <li>عدد الموضوعات المضافة: <strong>{watch('topics')?.length ?? 0}</strong></li>

                                  <li className="mt-2 font-semibold">الموضوعات المتبقية</li>
                                  <li>عدد الموضوعات المتبقية: <strong>{watch('remainingTopics')?.length ?? 0}</strong></li>
                                  <li>أسباب عدم الإنجاز: <strong>{(watch('reasonsJustifications') || '-').toString().slice(0,120) + (watch('reasonsJustifications')?.length>120?'…':'')}</strong></li>
                                  <li>المشاكل والصعوبات: <strong>{(watch('challengesDifficulties') || '-').toString().slice(0,120) + (watch('challengesDifficulties')?.length>120?'…':'')}</strong></li>
                                </ul>
                              </div>
                            </FormSection>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* أزرار التحكم */}
                      <div className="mt-6 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={prevStep}
                          disabled={current === 0}
                          className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white/80 px-4 py-2 text-sm text-aca-gray shadow hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ChevronRight size={16} />
                          السابق
                        </button>

                        {current < STEPS.length - 1 ? (
                          <button
                            type="button"
                            onClick={nextStep}
                            className="inline-flex items-center gap-2 rounded-lg bg-aca-gray px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
                          >
                            التالي
                            <ChevronLeft size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#1F1F1F] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
                          >
                            <CheckCircle2 size={16} />
                            إرسال الاستبيان
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* يمين: تعليمات + بطاقة بيانات الموظف الجاهزة */}
                <aside className="space-y-6">
                  {/* بطاقة بيانات من الملف الوظيفي (عرض فقط) */}
                  <div className="rounded-2xl border border-black/10 bg-white/70 p-6 backdrop-blur-xl shadow">
                    <div className="mb-3 flex items-center gap-2 text-sm text-aca-gray">
                      <User2 size={16} /> بياناتي الوظيفية
                    </div>
                    <ul className="text-sm text-neutral-800 space-y-1">
                      <li>الاسم: <strong>{watch('fullName') || '—'}</strong></li>
                      <li>الفرع: <strong>{watch('branch') || '—'}</strong></li>
                      <li>الوظيفة: <strong>{watch('role') || '—'}</strong></li>
                      <li>الإدارة: <strong>{watch('department') || '—'}</strong></li>
                      <li>المؤهل: <strong>{watch('degree') || '—'}</strong></li>
                      <li>التخصص: <strong>{watch('major') || '—'}</strong></li>
                      <li>الدورة: <strong>{watch('cycle') || '—'}</strong></li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white/70 p-6 backdrop-blur-xl shadow">
                    <div className="mb-2 flex items-center gap-2 text-sm text-aca-gray">
                      <FileText size={16} /> إرشادات سريعة
                    </div>
                    <ul className="list-disc space-y-2 pr-5 text-sm text-aca-gray">
                      <li>تأكد من صحة بياناتك المعروضة أعلاه قبل البدء.</li>
                      <li>أكمل جميع الحقول المطلوبة بدقة.</li>
                      {returnInfo && <li>راجع سبب الإرجاع جيدًا ثم أعد الإرسال.</li>}
                    </ul>
                  </div>
                </aside>
              </div>
            </>
          )}
        </main>

        <Toaster richColors position="top-center" />
      </div>
    </FormProvider>
  );
}
