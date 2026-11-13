const TONES = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  gold: 'bg-amber-50 text-gold-600 border-gold-400/50',
  royal: 'bg-royal-100 text-royal-800 border-purple-300',
  neutral: 'bg-white text-royal-800 border-purple-300',
  // For dark (royal) backgrounds
  goldGlass: 'bg-gold-400/20 text-gold-200 border-gold-300/50',
};

const SHAPES = {
  pill: 'rounded-full px-2.5 py-1',
  tag: 'rounded-md px-2.5 py-1',
};

/**
 * <StatusBadge tone="success">Up-to-Date</StatusBadge>
 * <StatusBadge tone="goldGlass" dot>Verified</StatusBadge>
 * <StatusBadge tone="goldGlass" icon={ShieldCheck}>Active Student</StatusBadge>
 */
export default function StatusBadge({
  tone = 'royal',
  shape = 'pill',
  icon: Icon,
  dot = false,
  className = '',
  children,
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 border text-[11px] font-bold ${TONES[tone]} ${SHAPES[shape]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" aria-hidden="true" />}
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}
