import { Award, CheckCircle2, QrCode, ShieldCheck, Sparkles, Star } from 'lucide-react';
import CrestBadge from '../../../components/common/CrestBadge';
import QRCode from '../../../components/common/QRCode';
import { APP_BRAND } from '../../../utils/constants';

const FEATURES = [
  { icon: QrCode, title: 'Instant QR check-in', text: 'Scan in at events in seconds' },
  { icon: Award, title: 'Stamps & badges', text: 'Collect proof of every activity' },
  { icon: ShieldCheck, title: 'Verified credential', text: 'Official record from MCU' },
];

const STAMPS = [
  { label: 'LEAD', rotate: '-rotate-12', tone: 'border-gold-400 text-gold-300' },
  { label: 'SERVE', rotate: 'rotate-6', tone: 'border-purple-200 text-purple-100' },
  { label: 'EXCEL', rotate: '-rotate-3', tone: 'border-gold-300 text-gold-200' },
];

/** Floating preview of the digital passport card, with little "live" notifications around it. */
function PassportPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm motion-safe:animate-float">
      {/* Glow behind the card */}
      <div className="absolute -inset-6 rounded-[2rem] bg-gold-500/20 blur-3xl" aria-hidden="true" />

      <div className="holo-sheen relative rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-royal-950/50 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CrestBadge size="sm" />
            <div className="leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">{APP_BRAND.institution}</p>
              <p className="font-display text-xs font-extrabold uppercase tracking-wide text-white">Digital Passport</p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Verified
          </span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-gold-400 bg-royal-800 font-display text-xl font-extrabold text-gold-300">
            JD
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-extrabold uppercase text-white">Juan Dela Cruz</p>
            <p className="text-xs text-purple-200">BS Information Technology</p>
            <p className="mt-1 font-mono text-[11px] font-bold tracking-wider text-gold-200">ID 2023-04387</p>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex gap-2.5">
            {STAMPS.map((s) => (
              <span
                key={s.label}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed text-[9px] font-extrabold tracking-wider ${s.rotate} ${s.tone}`}
              >
                {s.label}
              </span>
            ))}
          </div>
          <div className="rounded-xl bg-white p-1.5 shadow-lg">
            <QRCode value="MCU-DIGITAL-PASSPORT-PREVIEW" className="h-16 w-16" title="Sample passport QR code" />
          </div>
        </div>
      </div>

      {/* Floating notifications */}
      <div className="absolute -right-4 -top-5 flex items-center gap-2 rounded-2xl border border-gold-300/40 bg-white px-3 py-2 shadow-xl motion-safe:animate-float-slow sm:-right-10">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500 text-royal-950">
          <Star className="h-4 w-4" fill="currentColor" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-extrabold text-royal-900">+10 points</p>
          <p className="text-[10px] text-slate-500">Leadership Summit</p>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 flex items-center gap-2 rounded-2xl border border-purple-200 bg-white px-3 py-2 shadow-xl motion-safe:animate-float-slow [animation-delay:-4s] sm:-left-10">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-extrabold text-royal-900">Attendance verified</p>
          <p className="text-[10px] text-slate-500">Just now</p>
        </div>
      </div>
    </div>
  );
}

/** Left side of the sign-in page: brand story on Heritage Purple. */
export default function LoginShowcase() {
  return (
    <section className="relative isolate flex overflow-hidden bg-royal-950 px-5 pb-14 pt-6 text-white sm:px-10 sm:pb-16 sm:pt-8 lg:min-h-screen lg:w-[56%] lg:px-14 lg:py-12">
      {/* Background: gradient, moving glows, guilloche rings, dot grid */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-royal-900 via-royal-950 to-[#2c0a3f]" aria-hidden="true" />
      <div className="absolute -left-24 top-1/4 -z-10 h-80 w-80 rounded-full bg-royal-600/40 blur-3xl motion-safe:animate-blob" aria-hidden="true" />
      <div className="absolute -right-20 bottom-0 -z-10 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl motion-safe:animate-blob [animation-delay:-7s]" aria-hidden="true" />
      <svg className="absolute -right-40 -top-40 -z-10 h-[38rem] w-[38rem] text-gold-300/10" viewBox="0 0 200 200" fill="none" stroke="currentColor" aria-hidden="true">
        {[90, 75, 60, 45, 30].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} strokeWidth="0.4" strokeDasharray={r % 2 ? '2 3' : '1 2'} />
        ))}
      </svg>
      <div
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-xl flex-col">
        <div className="flex items-center gap-3 motion-safe:animate-fade-up">
          <CrestBadge size="lg" />
          <div className="leading-tight">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-300">{APP_BRAND.fullName}</p>
            <p className="font-display text-sm font-extrabold uppercase tracking-wide">{APP_BRAND.productName}</p>
          </div>
        </div>

        {/*
          Responsive rules:
          - Phones: short headline only, so the sign-in button is visible without scrolling.
          - Tablets: headline, intro and feature tiles.
          - Short screens below lg (landscape phones): brand bar only.
          - Desktop: everything, plus the floating passport card when the screen is tall enough.
        */}
        <div className="flex flex-1 flex-col justify-center py-6 sm:py-10 lg:py-8 max-lg:[@media(max-height:560px)]:hidden">
          <span className="hidden w-fit items-center gap-1.5 rounded-full border border-gold-300/40 bg-gold-400/10 px-3 py-1 text-xs font-bold text-gold-200 motion-safe:animate-fade-up [animation-delay:80ms] sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5" /> Your student life, officially recorded
          </span>
          <h1 className="font-display text-[clamp(1.6rem,7.6vw,2.25rem)] font-extrabold leading-[1.1] tracking-tight motion-safe:animate-fade-up [animation-delay:160ms] sm:mt-5 sm:text-5xl sm:leading-[1.08] xl:text-[3.4rem]">
            Every event.
            <br />
            Every achievement.
            <br />
            <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
              One passport.
            </span>
          </h1>
          <p className="mt-5 hidden max-w-md text-base leading-relaxed text-purple-100/90 motion-safe:animate-fade-up [animation-delay:240ms] sm:block">
            Check in with a tap, collect stamps for every activity, and build a verified record of your journey at{' '}
            {APP_BRAND.institution}.
          </p>

          <ul className="mt-8 hidden grid-cols-3 gap-3 motion-safe:animate-fade-up [animation-delay:320ms] sm:grid">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-gold-400" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold leading-snug">{title}</p>
                <p className="mt-0.5 text-xs text-purple-200/80">{text}</p>
              </li>
            ))}
          </ul>

          {/* Only on large screens tall enough to show the whole card */}
          <div className="mt-10 hidden origin-top scale-[0.88] motion-safe:animate-fade-up [animation-delay:420ms] lg:block [@media(max-height:820px)]:hidden">

            <PassportPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
