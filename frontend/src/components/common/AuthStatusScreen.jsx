import CrestBadge from './CrestBadge';
import MicrosoftLogo from './MicrosoftLogo';
import { APP_BRAND } from '../../utils/constants';

/**
 * Full-screen loader for sign-in / sign-out moments.
 *
 * variant:
 *   checking     - checking for an existing Microsoft 365 session (spinner)
 *   welcome      - sign-in succeeded: check mark + "Welcome back, <name>!" + progress bar
 *   signing-out  - ending the session (spinner)
 *   signed-out   - sign-out finished: check mark + progress bar
 *
 * overlay: cover the page (fixed) instead of being the page; leaving: fade out.
 */
const VARIANTS = {
  checking: { done: false, title: () => 'Signing you in', message: 'Connecting to Microsoft 365…', microsoft: true },
  welcome: {
    done: true,
    title: (name) => (name ? `Welcome back, ${name}!` : 'Welcome back!'),
    message: 'Signed in successfully. Opening your dashboard…',
  },
  'signing-out': { done: false, title: () => 'Signing you out', message: 'Ending your session securely…' },
  'signed-out': { done: true, title: () => 'You’ve been signed out', message: 'Your session has ended safely. See you again soon!' },
};

function SuccessCheck() {
  return (
    <span className="relative flex h-20 w-20 items-center justify-center motion-safe:animate-scale-in">
      <span className="absolute inset-0 rounded-full bg-emerald-400/20 motion-safe:animate-ping [animation-iteration-count:1]" aria-hidden="true" />
      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-900/40 ring-4 ring-white/15">
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="24" strokeDashoffset="24" className="motion-safe:animate-draw-check motion-reduce:[stroke-dashoffset:0]" />
        </svg>
      </span>
    </span>
  );
}

function Spinner() {
  return (
    <span className="relative flex h-20 w-20 items-center justify-center">
      <span className="absolute inset-0 rounded-full border-4 border-white/10" aria-hidden="true" />
      <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-gold-400 border-r-gold-400/40" aria-hidden="true" />
      <CrestBadge size="sm" className="!h-11 !w-11" />
    </span>
  );
}

export default function AuthStatusScreen({ variant = 'checking', name, overlay = false, leaving = false }) {
  const v = VARIANTS[variant] ?? VARIANTS.checking;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${overlay ? 'fixed inset-0 z-[100]' : 'relative min-h-screen'} isolate flex flex-col items-center justify-center overflow-hidden bg-royal-950 px-6 text-center text-white transition-opacity duration-300 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-royal-900 via-royal-950 to-[#2c0a3f]" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/15 blur-3xl" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden="true"
      />

      <div className="flex flex-col items-center motion-safe:animate-fade-up">
        {v.done ? <SuccessCheck /> : <Spinner />}

        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.25em] text-gold-300">{APP_BRAND.fullName}</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{v.title(name)}</h1>
        <p className="mt-2 max-w-sm text-sm text-purple-100/85">{v.message}</p>

        {v.done ? (
          <div className="mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-gold-400 to-gold-300 motion-safe:w-0 motion-safe:animate-progress" />
          </div>
        ) : (
          v.microsoft && (
            <div className="mt-8 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur-sm">
              <MicrosoftLogo className="h-3.5 w-3.5" />
              Secured by Microsoft 365
            </div>
          )
        )}
      </div>
    </div>
  );
}
