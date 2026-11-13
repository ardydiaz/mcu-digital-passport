import { NavLink } from 'react-router-dom';

/** Fixed bottom tab bar for small screens. Uses item.shortLabel when provided. */
export default function MobileBottomNav({ navItems }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-gold-500/40 bg-royal-950/95 px-2 py-1.5 backdrop-blur-xl md:hidden"
      aria-label="Main navigation"
    >
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
        {navItems.map(({ to, label, shortLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-xl py-1.5 transition-colors ${
                isActive ? 'font-bold text-gold-300' : 'font-medium text-purple-200/75 hover:text-white'
              }`
            }
          >
            <Icon className="mb-0.5 h-5 w-5" aria-hidden="true" />
            <span className="truncate text-[10px]">{shortLabel ?? label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
