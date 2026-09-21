import { isConfidencePassing } from "@/entities/verdict";
import { CONFIDENCE_THRESHOLD } from "@/shared/config";

interface ConfidenceGaugeProps {
  confidence: number;
}

const PERCENT = 100;

/** confidence 게이지. 임계값 마커를 함께 그려 통과/미달이 한눈에 보이게 한다. */
export function ConfidenceGauge({ confidence }: ConfidenceGaugeProps) {
  const passed = isConfidencePassing(confidence);
  const percent = Math.round(confidence * PERCENT);

  return (
    <div data-testid="confidence-gauge" data-passed={passed}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-content-muted">confidence</span>
        <span
          className={`font-semibold tabular-nums ${
            passed ? "text-auto-reply-strong" : "text-clarify-strong"
          }`}
        >
          {confidence.toFixed(2)}
        </span>
      </div>
      <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={`h-full rounded-full ${passed ? "bg-auto-reply" : "bg-clarify"}`}
          style={{ width: `${percent}%` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 bg-content"
          style={{ left: `${CONFIDENCE_THRESHOLD * PERCENT}%` }}
        />
      </div>
      <p
        className={`mt-1 text-xs ${
          passed ? "text-content-muted" : "font-medium text-clarify-strong"
        }`}
      >
        {passed
          ? `임계값 ${CONFIDENCE_THRESHOLD} 통과`
          : `임계값 ${CONFIDENCE_THRESHOLD} 미달`}
      </p>
    </div>
  );
}
