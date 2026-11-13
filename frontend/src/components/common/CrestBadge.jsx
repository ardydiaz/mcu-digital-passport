const SIZES = {
  sm: 'h-10 w-10 bg-royal-900 border-gold-500 p-1 shadow-md',
  lg: 'h-12 w-12 bg-royal-950 border-gold-400 p-1.5 shadow-lg shadow-gold-500/15',
};

/**
 * Institution crest. Pass `src` to use an image logo (e.g. the official MCU seal)
 * instead of the built-in SVG crest.
 */
export default function CrestBadge({ size = 'lg', src, alt = 'Institution crest', className = '' }) {
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-xl border-2 ${SIZES[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-contain" />
      ) : (
        <svg viewBox="0 0 64 64" className="h-full w-full" role="img" aria-label={alt}>
          <path d="M32 4 L54 12 V30 C54 45 43 55 32 60 C21 55 10 45 10 30 V12 Z" fill="#3B0F6B" stroke="#E5C158" strokeWidth="3" />
          <path d="M32 10 C35 15 37 18 34 22 C33 23 31 23 30 22 C27 18 29 15 32 10 Z" fill="#FDE68A" />
          <rect x="30.5" y="22" width="3" height="12" rx="1" fill="#D4AF37" />
          <path d="M16 32 Q24 29 32 34 Q40 29 48 32 V45 Q40 42 32 47 Q24 42 16 45 Z" fill="#FFFFFF" stroke="#2B0B4E" strokeWidth="1.5" />
          <line x1="32" y1="34" x2="32" y2="47" stroke="#2B0B4E" strokeWidth="1.5" />
          <path d="M18 49 Q32 54 46 49" fill="none" stroke="#E5C158" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}
