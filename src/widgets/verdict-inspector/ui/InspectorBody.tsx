import { sortProbabilities, type JevVerdict } from "@/entities/verdict";
import { ProbabilityBar } from "@/shared/ui";

import { BooleanIndicator } from "./BooleanIndicator";
import { ConfidenceGauge } from "./ConfidenceGauge";
import { FrustrationMeter } from "./FrustrationMeter";

interface InspectorBodyProps {
  verdict: JevVerdict;
  reason: string | null;
}

/** Jev 원시 판정 결과 본문 (docs/02-화면명세서.md S-02) */
export function InspectorBody({ verdict, reason }: InspectorBodyProps) {
  const probabilities = sortProbabilities(verdict.intent.probabilities);

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h3 className="text-xs font-semibold text-content">의도</h3>
        <ul className="mt-2 flex flex-col gap-1.5">
          {probabilities.map((entry) => (
            <ProbabilityBar
              key={entry.label}
              label={entry.label}
              value={entry.value}
              highlighted={entry.label === verdict.intent.choice}
            />
          ))}
        </ul>
        <div className="mt-3">
          <ConfidenceGauge confidence={verdict.intent.confidence} />
        </div>
      </section>

      <FrustrationMeter score={verdict.frustration.score} />

      <section className="flex flex-col gap-1.5">
        <BooleanIndicator label="긴급" value={verdict.isUrgent} />
        <BooleanIndicator label="이관필요" value={verdict.needsHuman} />
      </section>

      <p className="text-xs text-content-muted">⏱ {verdict.latencyMs}ms</p>

      {reason !== null ? (
        <section className="rounded-lg bg-surface-sunken p-3">
          <h3 className="text-xs font-semibold text-content">적용된 라우팅 규칙</h3>
          <p className="mt-1 text-xs leading-relaxed text-content-muted">{reason}</p>
        </section>
      ) : null}
    </div>
  );
}
