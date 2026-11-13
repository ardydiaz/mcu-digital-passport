import CrestBadge from '../common/CrestBadge';

/** Sticky white header with gold border. Shows the crest on mobile (sidebar is hidden there). */
export default function AppTopbar({ title, subtitle, actions, logoSrc }) {
  return (
    <header className="sticky top-0 z-20 border-b border-gold-500/30 bg-white/95 px-4 py-3.5 shadow-sm backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CrestBadge size="sm" src={logoSrc} className="md:hidden" />
          <div className="min-w-0">
            <h1 className="m-0 truncate font-display text-base font-extrabold uppercase tracking-wider text-royal-900 sm:text-xl">
              {title}
            </h1>
            {subtitle && <p className="hidden text-xs font-medium text-royal-700 sm:block">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2 sm:gap-3">{actions}</div>}
      </div>
    </header>
  );
}
