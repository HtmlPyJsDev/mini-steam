interface AvatarProps {
  src?: string | null;
  name?: string;
  email?: string;
  size?: number;
  className?: string;
}

function initialsOf(input: string): string {
  const parts = input.trim().split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = h % 360;
  return `hsl(${hue}, 60%, 35%)`;
}

export function Avatar({ src, name, email, size = 48, className }: AvatarProps) {
  const seed = (name || email || '').trim() || '?';
  const initials = initialsOf(seed);
  const bg = colorFor(seed);
  const cls = `avatar${className ? ` ${className}` : ''}`;
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };

  if (src) {
    return (
      <span className={cls} style={style}>
        <img src={src} alt={seed} loading="lazy" />
      </span>
    );
  }
  return (
    <span className={cls} style={{ ...style, background: bg }}>
      <span className="avatar__initials">{initials}</span>
    </span>
  );
}
