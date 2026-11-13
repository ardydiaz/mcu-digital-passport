/** White frame with gold corner brackets (photos, QR codes). */
export default function GoldFrame({ className = 'p-1', children, ...props }) {
  return (
    <div {...props} className={`gold-corners inline-block rounded-2xl bg-white shadow-xl ${className}`}>
      {children}
    </div>
  );
}
