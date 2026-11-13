/**
 * <ProgressBar value={340} max={500} label="Semester Goal" valueLabel="340 / 500" />
 */
export default function ProgressBar({ value, max = 100, label, valueLabel, size = 'md', className = '' }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const height = size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={className}>
      {(label || valueLabel) && (
        <div className="mb-1 flex justify-between text-xs text-slate-600">
          <span>{label}</span>
          <span className="font-extrabold text-royal-900">{valueLabel}</span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full border border-purple-200 bg-royal-100 ${height}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-royal-700 via-royal-600 to-gold-500 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
