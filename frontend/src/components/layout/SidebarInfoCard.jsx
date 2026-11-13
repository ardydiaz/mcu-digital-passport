/** Dark info card for the sidebar footer, e.g. credential status. */
export default function SidebarInfoCard({ label, badge, children }) {
  return (
    <div className="rounded-2xl border border-gold-400/30 bg-royal-950/90 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs text-purple-200">{label}</span>
        {badge}
      </div>
      {children && <p className="text-[11px] leading-relaxed text-purple-200/80">{children}</p>}
    </div>
  );
}
