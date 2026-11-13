/** Small centered stat: label over a big number. */
export default function StatTile({ label, value, highlight = false, className = '' }) {
  return (
    <div
      className={`rounded-2xl border bg-white p-3 text-center shadow-sm ${highlight ? 'border-gold-400/60' : 'border-purple-200'} ${className}`}
    >
      <span className="block text-xs text-slate-500">{label}</span>
      <span className={`font-display text-xl font-extrabold ${highlight ? 'text-gold-600' : 'text-royal-900'}`}>
        {value}
      </span>
    </div>
  );
}
