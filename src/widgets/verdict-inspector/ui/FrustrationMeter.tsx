import { FRUSTRATION_LABELS, FRUSTRATION_MAX_LEVEL } from "@/shared/config";

interface FrustrationMeterProps {
  score: number;
}

const LEVELS = Array.from({ length: FRUSTRATION_MAX_LEVEL + 1 }, (_, index) => index);

/** 불만도 0/1/2 세그먼트 바 */
export function FrustrationMeter({ score }: FrustrationMeterProps) {
  const level = Math.round(score);

  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-content-muted">불만도</span>
        <span className="font-semibold tabular-nums text-content">
          {score.toFixed(1)}
        </span>
      </div>
      <ul className="mt-1.5 flex gap-1" aria-label="불만도 레벨">
        {LEVELS.map((current) => (
          <li
            key={current}
            title={FRUSTRATION_LABELS[current]}
            data-filled={current <= level}
            className={`h-2 flex-1 rounded-full ${
              current <= level
                ? current >= FRUSTRATION_MAX_LEVEL
                  ? "bg-escalate"
                  : "bg-clarify"
                : "bg-surface-sunken"
            }`}
          />
        ))}
      </ul>
      <p className="mt-1 text-xs text-content-muted">
        {FRUSTRATION_LABELS[Math.min(level, FRUSTRATION_MAX_LEVEL)]}
      </p>
    </div>
  );
}
