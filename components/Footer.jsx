export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-[12px] text-neutral-600">
        <div>© {new Date().getFullYear()} هيئة الرقابة الإدارية</div>
        <div className="flex items-center gap-4">
          <a className="hover:text-aca-gray">سياسة الخصوصية</a>
          <a className="hover:text-aca-gray">الشروط والأحكام</a>
        </div>
      </div>
    </footer>
  );
}
