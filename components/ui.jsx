'use client';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition';
  const styles = {
    primary: 'bg-aca.green text-white hover:opacity-90',
    danger:  'bg-aca.red text-white hover:opacity-90',
    accent:  'bg-aca.gold text-aca.dark hover:opacity-95',
    neutral: 'bg-aca.gray text-white hover:opacity-90',
    outline: 'border border-aca.gray text-aca.gray hover:bg-aca.gray hover:text-white',
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-aca.gold ${props.className || ''}`}
    />
  );
}
