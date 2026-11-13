import IconTile from '../common/IconTile';

/** Title block at the top of a page, with optional icon and right-side actions. */
export default function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        {icon && <IconTile icon={icon} />}
        <div>
          <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-royal-900 sm:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
