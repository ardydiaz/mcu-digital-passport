import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import IconTile from '../common/IconTile';

const titleClass =
  'font-display text-base font-extrabold uppercase tracking-wide text-royal-900 transition-colors group-hover:text-royal-700 sm:text-lg';

/**
 * Dashboard tile: icon, badge, title, free-form body and a footer call-to-action.
 * Renders as a router link when `to` is given, or a button when `onClick` is given.
 *
 * inlineHeader: put the title (and description) next to the icon — used for wide cards.
 */
export default function FeatureCard({
  to,
  onClick,
  icon,
  title,
  description,
  badge,
  actionLabel,
  inlineHeader = false,
  className = '',
  children,
}) {
  const Wrapper = to ? Link : onClick ? 'button' : 'div';
  const wrapperProps = to ? { to } : onClick ? { type: 'button', onClick } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`group flex flex-col justify-between rounded-2xl border border-purple-200/80 bg-white p-5 text-left shadow-md transition-all duration-300 hover:border-gold-500 hover:bg-royal-50/70 hover:shadow-xl hover:shadow-royal-900/10 ${className}`}
    >
      <div className="w-full">
        <div className="mb-4 flex items-start justify-between gap-3">
          {inlineHeader ? (
            <div className="flex items-center gap-3">
              <IconTile icon={icon} className="group-hover:scale-110" />
              <div>
                <h4 className={titleClass}>{title}</h4>
                {description && <p className="text-xs text-slate-600">{description}</p>}
              </div>
            </div>
          ) : (
            <IconTile icon={icon} className="group-hover:scale-110" />
          )}
          {badge}
        </div>

        {!inlineHeader && <h4 className={`mb-1 ${titleClass}`}>{title}</h4>}
        {!inlineHeader && description && <p className="text-sm text-slate-600">{description}</p>}
        {children}
      </div>

      {actionLabel && (
        <div className="mt-5 flex w-full items-center justify-between border-t border-purple-100 pt-3 text-xs font-bold text-gold-600 group-hover:text-royal-800">
          <span>{actionLabel}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      )}
    </Wrapper>
  );
}
