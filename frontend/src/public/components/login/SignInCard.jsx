import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Briefcase, GraduationCap, Lock, Wrench } from 'lucide-react';
import CrestBadge from '../../../components/common/CrestBadge';
import MicrosoftLogo from '../../../components/common/MicrosoftLogo';
import { ACCOUNT_DOMAINS, APP_BRAND } from '../../../utils/constants';

const ACCOUNT_TYPES = [
  { icon: GraduationCap, label: 'Students', domain: ACCOUNT_DOMAINS.student },
  { icon: Briefcase, label: 'Faculty & Staff', domain: ACCOUNT_DOMAINS.staff },
];

/** The sign-in panel: one "Sign in with Microsoft" button for every role. */
export default function SignInCard({ onSignIn, isLoading, error, devRole }) {
  return (
    <div className="w-full max-w-md motion-safe:animate-fade-up [animation-delay:150ms]">
      <div className="rounded-3xl border border-purple-200/70 bg-white p-6 shadow-2xl shadow-royal-900/10 backdrop-blur-xl sm:p-9 lg:bg-white/90">
        <CrestBadge size="xl" className="max-sm:h-14 max-sm:w-14 max-lg:[@media(max-height:560px)]:hidden" />

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gold-600 max-lg:[@media(max-height:560px)]:mt-0">Welcome</p>
        <h2 className="mt-1.5 font-display text-2xl font-extrabold leading-tight text-royal-900 sm:text-3xl">
          Sign in to your Digital Passport
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
          Use your {APP_BRAND.institution} Microsoft 365 account to continue.
        </p>

        {error && (
          <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onSignIn}
          disabled={isLoading}
          className="group mt-7 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-[15px] font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-royal-700 hover:shadow-lg hover:shadow-royal-900/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-400/40 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
        >
          {isLoading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-slate-200 border-t-royal-700" aria-hidden="true" />
          ) : (
            <MicrosoftLogo />
          )}
          <span>{isLoading ? 'Signing you in…' : 'Sign in with Microsoft'}</span>
          {!isLoading && (
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-royal-700" />
          )}
        </button>

        {devRole && (
          <p className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            <Wrench className="h-3.5 w-3.5" />
            Dev mode: signs in as a mock {devRole} (remove VITE_DEV_MOCK_ROLE to use Microsoft 365).
          </p>
        )}

        <div className="mt-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" /> Accepted accounts
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <ul className="mt-4 grid gap-2">
          {ACCOUNT_TYPES.map(({ icon: Icon, label, domain }) => (
            <li key={label} className="flex items-center gap-3 rounded-xl border border-purple-100 bg-royal-50 px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-royal-900 text-gold-300">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 leading-tight">
                <span className="text-sm font-bold text-royal-900">{label}</span>
                <span className="break-all text-xs font-semibold text-royal-700">@{domain}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Trouble signing in?{' '}
        <Link to="/contact" className="font-semibold text-royal-700 hover:text-gold-600">
          Contact the ICT Office
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {APP_BRAND.fullName} ·{' '}
        <Link to="/privacy-policy" className="hover:text-royal-700">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
