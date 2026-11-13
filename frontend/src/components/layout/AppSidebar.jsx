import { NavLink } from 'react-router-dom';
import CrestBadge from '../common/CrestBadge';

/** Desktop sidebar (hidden below md). navItems: [{ to, label, icon, end? }] */
export default function AppSidebar({ brand, navItems, footer }) {
  return (
    <aside className="z-30 hidden border-r border-gold-500/30 bg-royal-900 shadow-xl md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
      <div className="flex items-center gap-3.5 border-b border-white/10 p-6">
        <CrestBadge size="lg" src={brand.logoSrc} />
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">{brand.eyebrow}</span>
          <p className="font-display text-sm font-extrabold uppercase leading-tight tracking-wide text-white">
            {brand.title}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex w-full items-center gap-3.5 rounded-xl border-l-4 px-4 py-3 text-sm ${
                isActive
                  ? 'border-gold-500 bg-white font-semibold shadow-md shadow-royal-950/30'
                  : 'border-transparent font-medium transition-colors hover:bg-royal-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-5 w-5 shrink-0 ${isActive ? 'text-royal-700' : 'text-gold-300'}`}
                  aria-hidden="true"
                />
                <span className={isActive ? 'text-royal-900' : 'text-purple-100'}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {footer && <div className="m-4">{footer}</div>}
    </aside>
  );
}
