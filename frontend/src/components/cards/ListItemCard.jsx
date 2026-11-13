import IconTile from '../common/IconTile';

/**
 * White row card: optional icon, gold eyebrow line, title, description and a trailing slot
 * (badge, button, points…). `highlight` gives it a gold border.
 */
export default function ListItemCard({
  icon,
  iconTone = 'royal',
  eyebrow,
  title,
  description,
  trailing,
  highlight = false,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${highlight ? 'border-gold-400/70' : 'border-purple-200'} ${className}`}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        {icon && <IconTile icon={icon} tone={iconTone} size="sm" />}
        <div className="min-w-0">
          {eyebrow && <span className="text-[11px] font-extrabold uppercase text-gold-600">{eyebrow}</span>}
          <p className="font-bold text-royal-950">{title}</p>
          {description && <p className="mt-0.5 text-xs text-slate-600">{description}</p>}
        </div>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
