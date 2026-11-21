import { NavLink } from 'react-router-dom';
import { GraduationCap, Megaphone, ShieldCheck } from 'lucide-react';
import useAuth from '../../auth/useAuth';
import { getAccessibleDashboards } from '../../auth/authService';

const ICONS = { admin: ShieldCheck, organizer: Megaphone, student: GraduationCap };

/**
 * Switch between dashboards (Admin / Organizer / Student).
 * Shown only to users who can open more than one, e.g. the IT Administrator (full access).
 */
export default function DashboardSwitcher({ className = '' }) {
  const { roles } = useAuth();
  const dashboards = getAccessibleDashboards(roles);
  if (dashboards.length < 2) return null;

  return (
    <nav aria-label="Switch dashboard" className={`flex items-center gap-2 overflow-x-auto ${className}`}>
      <span className="hidden shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:inline">View as</span>
      <div className="flex shrink-0 gap-1 rounded-xl border border-purple-200 bg-white p-1 shadow-sm">
        {dashboards.map(({ key, label, to }) => {
          const Icon = ICONS[key];
          return (
            <NavLink
              key={key}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  isActive ? 'bg-royal-900 text-gold-300 shadow' : 'text-royal-800 hover:bg-royal-50'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
