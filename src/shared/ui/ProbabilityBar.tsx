interface ProbabilityBarProps {
  label: string;
  /** 0 ~ 1 */
  value: number;
  /** 선택된 후보를 강조한다 */
  highlighted?: boolean;
}

const PERCENT = 100;

export function ProbabilityBar({ label, value, highlighted = false }: ProbabilityBarProps) {
  const percent = Math.round(clampToUnit(value) * PERCENT);

  return (
    <li className="flex items-center gap-2 text-xs">
      <span
        className={`w-20 shrink-0 truncate ${
          highlighted ? "font-semibold text-content" : "text-content-muted"
        }`}
      >
        {label}
      </span>
      <span
        role="meter"
        aria-label={`${label} 확률`}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={PERCENT}
        className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken"
      >
        <span
          className={`block h-full rounded-full ${
            highlighted ? "bg-auto-reply" : "bg-line-strong"
          }`}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="w-10 shrink-0 text-right tabular-nums text-content-muted">
        {value.toFixed(2)}
      </span>
    </li>
  );
}

function clampToUnit(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 1);
}
