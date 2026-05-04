interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
  ariaLabel?: string;
}

export function StarRating({
  value,
  max = 5,
  size = 18,
  interactive = false,
  onChange,
  className = '',
  ariaLabel,
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const cls = `star-rating${interactive ? ' star-rating--interactive' : ''} ${className}`.trim();

  return (
    <span
      className={cls}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={ariaLabel || `${value} of ${max}`}
    >
      {stars.map((n) => {
        const fillRatio = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <button
            key={n}
            type="button"
            className="star-rating__btn"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(n)}
            aria-label={`${n}`}
            aria-pressed={interactive ? value >= n : undefined}
            style={{ width: size, height: size }}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`star-grad-${n}-${size}-${value}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={`${fillRatio * 100}%`} stopColor="#ffd34d" />
                  <stop offset={`${fillRatio * 100}%`} stopColor="rgba(120,140,170,0.3)" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.6l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.77l-5.9 3.01 1.13-6.58L2.45 9.54l6.6-.96L12 2.6z"
                fill={`url(#star-grad-${n}-${size}-${value})`}
                stroke="rgba(255,211,77,0.65)"
                strokeWidth="0.6"
              />
            </svg>
          </button>
        );
      })}
    </span>
  );
}
