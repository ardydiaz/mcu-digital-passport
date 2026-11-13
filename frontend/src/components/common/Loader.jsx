export default function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 text-sm font-medium text-royal-800 ${className}`} role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-royal-100 border-t-gold-500" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
