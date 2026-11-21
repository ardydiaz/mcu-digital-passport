import { GraduationCap, LayoutDashboard, Megaphone, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/navigation/PageHeader';
import FeatureCard from '../../components/cards/FeatureCard';
import useAuth from '../../auth/useAuth';
import { getAccessibleDashboards } from '../../auth/authService';

const DASHBOARD_INFO = {
  admin: {
    icon: ShieldCheck,
    description: 'Activities, participation records, manual validation, reports and the audit log.',
  },
  organizer: {
    icon: Megaphone,
    description: 'Assigned activities, QR attendance scanning and attendance validation.',
  },
  student: {
    icon: GraduationCap,
    description: 'Digital passport, QR pass, bucket list progress and activity history.',
  },
};

export default function Dashboard() {
  const { user, roles } = useAuth();
  const dashboards = getAccessibleDashboards(roles);
  const firstName = user?.name?.split(' ')[0];

  return (
    <>
      <PageHeader
        icon={LayoutDashboard}
        title={`Welcome${firstName ? `, ${firstName}` : ''}`}
        subtitle={`Signed in as ${user?.email ?? ''} · ${roles.join(', ') || 'no role'}`}
      />

      {dashboards.length > 1 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Your dashboards</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboards.map(({ key, label, to }) => (
              <FeatureCard
                key={key}
                to={to}
                icon={DASHBOARD_INFO[key].icon}
                title={`${label} dashboard`}
                description={DASHBOARD_INFO[key].description}
                actionLabel={`Open ${label}`}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
