interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 32, withWordmark = true, className }: LogoProps) {
  return (
    <span className={`logo${className ? ` ${className}` : ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="uzisoft-logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#66c0f4" />
            <stop offset="55%" stopColor="#4794c8" />
            <stop offset="100%" stopColor="#1a3554" />
          </linearGradient>
          <linearGradient id="uzisoft-logo-glyph" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cfe7ff" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#uzisoft-logo-grad)" />
        <path
          d="M20 18v22a12 12 0 0 0 24 0V18"
          stroke="url(#uzisoft-logo-glyph)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="32" cy="48" r="3" fill="#ffffff" opacity="0.9" />
      </svg>
      {withWordmark ? <span className="logo__wordmark">Uzisoft</span> : null}
    </span>
  );
}
