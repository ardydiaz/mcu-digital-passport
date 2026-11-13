import { useId } from 'react';

export default function Input({ label, error, hint, id, className = '', ...props }) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-xs font-bold uppercase tracking-wider text-royal-800">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        {...props}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-royal-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 ${error ? 'border-red-400' : 'border-purple-200'}`}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}
