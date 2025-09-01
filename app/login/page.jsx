'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Toaster, toast } from 'sonner';
import { User, Lock, Eye, EyeOff, ShieldCheck, BarChart3, KeyRound } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import localFont from 'next/font/local';


const diwani = localFont({
  src: '../../public/fonts/Diwani.ttf', // عدّل المسار حسب مكان الصفحة
  display: 'swap',
});

/* ====== إعداد عام ====== */
const schema = z.object({
  username: z.string().min(3, 'أدخل اسم مستخدم صحيح').max(64),
  password: z.string().min(6, 'كلمة المرور قصيرة').max(128),
  remember: z.boolean().default(true),
});

export default function LoginPage() {
  const [lang, setLang] = useState('ar'); // 'ar' | 'en'
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const monthLabel = useMemo(() => {
    const d = new Date();
    const ar = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const en = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return lang === 'ar' ? `${ar[d.getMonth()]} ${d.getFullYear()}` : `${en[d.getMonth()]} ${d.getFullYear()}`;
  }, [lang]);

  const t = (k) => ({
    brand: { ar: 'هيئة الرقابة الإدارية', en: 'Administrative Control Authority' },
    subtitle: { ar: 'المنظومة المؤسسية للاستبيانات الشهرية', en: 'Monthly Surveys Platform' },
    login: { ar: 'تسجيل الدخول', en: 'Sign in' },
    username: { ar: 'اسم المستخدم', en: 'Username' },
    password: { ar: 'كلمة المرور', en: 'Password' },
    remember: { ar: 'تذكرني', en: 'Remember me' },
    forgot: { ar: 'نسيت كلمة المرور؟', en: 'Forgot password?' },
    currentCycle: { ar: 'الدورة الحالية', en: 'Current Cycle' },
    cta: { ar: 'دخول', en: 'Sign in' },
    help: { ar: 'فضلاً أدخل بياناتك للمتابعة', en: 'Enter your credentials to continue' },
    secure: { ar: 'اتصال آمن', en: 'Secure connection' },
    roles: { ar: 'صلاحيات أدوار', en: 'Role-based access' },
    audit: { ar: 'تقارير تدقيق', en: 'Audit reports' },
  }[k]?.[lang] ?? k);

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { username: '', password: '', remember: true },
  });

  const onSubmit = async (values) => {
    if (!isValid) return;
    setSubmitting(true);
    toast.loading(lang === 'ar' ? 'جاري التحقق…' : 'Verifying…', { id: 'login' });
    try {
      // محاكاة API
      await new Promise((r) => setTimeout(r, 900));
      document.cookie = `auth=1; path=/; max-age=${values.remember ? 86400 : 3600}`;
      localStorage.setItem('user', JSON.stringify({ username: values.username }));
      toast.success(lang === 'ar' ? 'تم الدخول بنجاح' : 'Signed in', { id: 'login' });
      window.location.href = '/';
    } catch (e) {
      toast.error(lang === 'ar' ? 'فشل الدخول' : 'Sign-in failed', { id: 'login' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative n overflow-hidden text-[#1A1A1A]"
      style={{ backgroundColor: '#F4EDDF' }} // Beige
    >
      {/* خلفية بيج فاخرة: تدرج + هالات + نمط دقيق + خطوط ذهبية */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7F2E6] via-[#F4EDDF] to-[#FFFDF8]" />
        <div className="absolute -top-44 -left-44 h-[560px] w-[560px] rounded-full bg-aca-gold/20 blur-3xl" />
        <div className="absolute -bottom-56 -right-56 h-[640px] w-[640px] rounded-full bg-aca-green/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_28px_28px,rgba(0,0,0,0.35)_1.2px,transparent_1.2px)] [background-size:36px_36px]" />
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <div className="absolute -right-44 top-0 h-[140%] w-px rotate-6 bg-gradient-to-b from-transparent via-aca-gold/40 to-transparent" />
          <div className="absolute -right-28 top-0 h-[140%] w-[2px] rotate-6 bg-gradient-to-b from-transparent via-aca-gold/25 to-transparent" />
          <div className="absolute -right-12 top-0 h-[140%] w-px rotate-6 bg-gradient-to-b from-transparent via-aca-gold/20 to-transparent" />
        </div>
      </div>

      {/* شريط علوي شفاف + تبديل لغة */}
      <header className="relative z-10 border-b border-black/5 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-md shadow" />
            <div className="text-sm text-neutral-600">{t('subtitle')}</div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setLang('ar')}
              className={twMerge('rounded-md px-2 py-1 transition', lang === 'ar' ? 'bg-aca-gold text-aca-dark shadow' : 'text-neutral-700 hover:text-neutral-900')}
            >عربي</button>
            <span className="text-neutral-400">/</span>
            <button
              onClick={() => setLang('en')}
              className={twMerge('rounded-md px-2 py-1 transition', lang === 'en' ? 'bg-aca-gold text-aca-dark shadow' : 'text-neutral-700 hover:text-neutral-900')}
            >EN</button>
          </div>
        </div>
      </header>

      {/* المحتوى */}
      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 lg:grid-cols-[1.05fr,1fr]">
        {/* عمود الهوية */}
       <section className="hidden lg:block">
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center text-center gap-3"
  >
    {/* الشعار */}
    <Image
      src="/logo.png"
      alt="شعار الهيئة"
      width={110}
      height={110}
      className="drop-shadow-lg"
    />

    {/* اسم الهيئة */}
    <h1
  className={`${diwani.className} text-6xl font-bold text-transparent bg-clip-text
              bg-gradient-to-r from-[#AD8F2F] via-[#E3C565] to-[#E9DFA9]
              animate-[goldSheen_6s_linear_infinite] [background-size:200%_100%] [background-position:0%_50%]`}
>
  هيئة الرقابة الإدارية
</h1>


    {/* الوصف */}
    <p className="mt-5 text-base text-neutral-700">{t('subtitle')}</p>
  </motion.div>



          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-8 rounded-2xl border border-black/5 bg-white/70 p-6 shadow-[0_22px_66px_-32px_rgba(0,0,0,0.35)] backdrop-blur"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm text-neutral-500">{t('currentCycle')}</div>
                <div className="text-lg font-semibold text-[#1A1A1A]">{monthLabel}</div>
              </div>
              <div className="h-10 w-px bg-black/10" />
              <div className="flex items-center gap-4 text-xs text-neutral-600">
                <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> {t('secure')}</span>
                <span className="inline-flex items-center gap-1"><KeyRound size={14} /> {t('roles')}</span>
                <span className="inline-flex items-center gap-1"><BarChart3 size={14} /> {t('audit')}</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* بطاقة تسجيل الدخول */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.65, ease: 'easeOut' }}
            className="relative mx-auto w-full max-w-md rounded-2xl p-[2px] bg-gradient-to-br from-[#6B8E23] via-[#C9A23F] to-[#4B6F3E] shadow-[0_28px_80px_-26px_rgba(0,0,0,0.45)]"
          >
            {/* لمعة متحركة على الإطار */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:linear-gradient(#000,#000)]">
              <motion.span
                initial={{ x: '-150%' }} animate={{ x: '150%' }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-y-0 -left-1/3 w-1/3 rotate-6 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </div>

            {/* البطاقة الزجاجية */}
            <div className="relative rounded-2xl border border-black/10 bg-white/70 p-8 backdrop-blur-xl">
              {/* رأس البطاقة */}
              <div className="text-center">
                <Image src="/logo.png" alt="شعار" width={76} height={76} className="mx-auto rounded-xl shadow" />
                <div className="mx-auto mt-3 h-1.5 w-24 rounded bg-gradient-to-r from-aca-green via-aca-gold to-aca-red" />
                <h2 className="mt-4 text-lg font-semibold text-[#1A1A1A]">{t('login')}</h2>
                <p className="mt-1 text-xs text-neutral-600">{t('help')}</p>
              </div>

              {/* النموذج */}
              <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* اسم المستخدم */}
                <div className="relative">
                  <User className="pointer-events-none absolute right-3 top-3.5 text-neutral-500" size={18} />
                  <input
                    type="text"
                    placeholder=""
                    className={twMerge(
                      'peer w-full rounded-lg border bg-white/85 px-10 py-3 text-sm outline-none focus:ring-2',
                      errors.username ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
                    )}
                    {...register('username')}
                  />
                  <label
                    className={clsx(
                      'pointer-events-none absolute right-10 top-3.5 text-sm text-neutral-500 transition-all',
                      'peer-focus:-top-2 peer-focus:text-[11px] peer-focus:text-aca-gold',
                      'peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-[11px]'
                    )}
                  >
                    {t('username')}
                  </label>
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
                  )}
                </div>

                {/* كلمة المرور */}
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-3.5 text-neutral-500" size={18} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder=""
                    className={twMerge(
                      'peer w-full rounded-lg border bg-white/85 px-10 py-3 text-sm outline-none focus:ring-2',
                      errors.password ? 'border-red-300 focus:ring-red-300' : 'border-neutral-200 focus:ring-aca-gold'
                    )}
                    {...register('password')}
                  />
                  <label
                    className={clsx(
                      'pointer-events-none absolute right-10 top-3.5 text-sm text-neutral-500 transition-all',
                      'peer-focus:-top-2 peer-focus:text-[11px] peer-focus:text-aca-gold',
                      'peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-[11px]'
                    )}
                  >
                    {t('password')}
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute left-3 top-3 text-neutral-600 hover:text-neutral-900"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* تذكرني + نسيت كلمة المرور */}
                <div className="mt-1 flex items-center justify-between text-xs text-neutral-600">
                  <label className="inline-flex select-none items-center gap-2">
                    <input type="checkbox" className="accent-aca-gold" {...register('remember')} onChange={(e) => setValue('remember', e.target.checked)} defaultChecked />
                    {t('remember')}
                  </label>
                  <a href="#" className="hover:text-neutral-900">{t('forgot')}</a>
                </div>

                {/* زر الدخول الفاخر */}
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  type="submit" disabled={submitting || !isValid}
                  className={twMerge(
                    'group relative mt-2 w-full overflow-hidden rounded-lg bg-[#1F1F1F] py-2.5 text-sm font-semibold text-white',
                    'shadow-[0_14px_44px_-14px_rgba(0,0,0,0.45)] transition disabled:cursor-not-allowed disabled:opacity-60'
                  )}
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    {submitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    {t('cta')}
                  </span>
                  {/* لمعة Foil */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.32),transparent)] opacity-0 transition-all duration-700 group-hover:translate-x-0 group-hover:opacity-100" />
                  {/* خط ذهبي سفلي */}
                  <span className="pointer-events-none absolute inset-x-0 -bottom-[2px] mx-auto block h-[2px] w-2/3 bg-gradient-to-r from-aca-green via-aca-gold to-aca-red opacity-80" />
                </motion.button>
              </form>

              {/* شريط ثقة صغير */}
              <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-neutral-600">
                <span className="inline-flex items-center gap-1"><ShieldCheck size={13} /> {t('secure')}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><KeyRound size={13} /> {t('roles')}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><BarChart3 size={13} /> {t('audit')}</span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

     

      {/* حركات CSS للّمعان الذهبي */}
      <style jsx global>{`
  @keyframes goldSheen {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
`}</style>


      {/* Toasts */}
      <Toaster richColors position="top-center" />
    </div>
  );
  
}
