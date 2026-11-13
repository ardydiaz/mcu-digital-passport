/** White & gold banner: « TITLE » */
export default function SectionDivider({ children, className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 rounded-2xl border-y-2 border-gold-400/60 bg-white px-4 py-2.5 shadow-sm ${className}`}
    >
      <span className="select-none text-lg font-extrabold text-gold-500" aria-hidden="true">
        &laquo;
      </span>
      <h3 className="text-center font-display text-sm font-extrabold uppercase tracking-[0.18em] text-royal-900 sm:text-base">
        {children}
      </h3>
      <span className="select-none text-lg font-extrabold text-gold-500" aria-hidden="true">
        &raquo;
      </span>
    </div>
  );
}
