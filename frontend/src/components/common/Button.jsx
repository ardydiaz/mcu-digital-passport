const VARIANTS = {
  gold: 'bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-royal-950 font-display font-bold shadow-md shadow-gold-500/20',
  royal: 'bg-royal-800 hover:bg-royal-700 text-white font-semibold',
  glass: 'bg-white/10 hover:bg-white/20 text-white border border-gold-300/40 font-semibold',
  soft: 'bg-royal-50 hover:bg-royal-100 border border-purple-200 text-royal-800 font-semibold',
  success: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-display font-bold',
};

const SIZES = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-2.5 text-xs sm:text-sm',
  lg: 'px-5 py-3 text-sm',
  icon: 'p-2.5',
};

/**
 * Themed button. Pass `as={Link}` (plus `to`) to render a router link with the same style.
 *
 * <Button icon={QrCode} onClick={openPass}>Quick ID Pass</Button>
 * <Button variant="glass" icon={RefreshCw} iconClassName="text-gold-300">Refresh</Button>
 */
export default function Button({
  as: Component = 'button',
  variant = 'gold',
  size = 'md',
  icon: Icon,
  iconClassName = '',
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const typeProps = Component === 'button' ? { type: props.type ?? 'button' } : {};

  return (
    <Component
      {...props}
      {...typeProps}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon className={`h-4 w-4 shrink-0 ${iconClassName}`} aria-hidden="true" />}
      {children}
    </Component>
  );
}
