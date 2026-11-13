const TONES = {
  royal: 'bg-royal-900 text-gold-300 border border-gold-400/50',
  soft: 'bg-royal-100 text-royal-800 border border-purple-200',
  // For dark (royal) backgrounds
  glass: 'bg-royal-950/60 text-gold-300 border border-gold-400/50',
  goldGlass: 'bg-gold-400/20 text-gold-300',
};

const SIZES = {
  xs: { box: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
  sm: { box: 'h-10 w-10 rounded-xl', icon: 'h-5 w-5' },
  md: { box: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
};

/** Square icon container used on cards, modal headers and list items. */
export default function IconTile({ icon: Icon, tone = 'royal', size = 'md', className = '' }) {
  const s = SIZES[size];
  return (
    <div
      className={`flex shrink-0 items-center justify-center shadow-sm transition-all ${TONES[tone]} ${s.box} ${className}`}
    >
      <Icon className={s.icon} aria-hidden="true" />
    </div>
  );
}
