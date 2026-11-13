import { useState } from 'react';

const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Photo with an initials fallback when there is no photo or it fails to load. */
export default function Avatar({ src, name, className = 'h-12 w-12 rounded-xl' }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return <img src={src} alt={name} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center bg-royal-900 font-display text-2xl font-extrabold text-gold-400 ${className}`}
    >
      {initialsOf(name)}
    </div>
  );
}
