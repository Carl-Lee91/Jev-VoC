import { CHAT_COPY, CLARIFY_INTENT_CHOICES, INTENT_LABELS } from "@/shared/config";
import { Button } from "@/shared/ui";

interface ClarifyCardProps {
  onSelectIntent: (message: string) => void;
  onEscalate?: () => void;
  disabled?: boolean;
}

/** 되묻기 분기 카드 — 의도 후보 칩 + 상담원 연결 (docs/02-화면명세서.md S-01) */
export function ClarifyCard({
  onSelectIntent,
  onEscalate,
  disabled = false,
}: ClarifyCardProps) {
  return (
    <section
      aria-label="되묻기 안내"
      className="rounded-2xl border border-clarify-line bg-clarify-soft p-4"
    >
      <h3 className="text-sm font-semibold text-clarify-strong">
        {CHAT_COPY.clarifyPrompt}
      </h3>
      <p className="mt-1 text-sm text-content-muted">{CHAT_COPY.clarifyHint}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {CLARIFY_INTENT_CHOICES.map((intent) => (
          <li key={intent}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelectIntent(`${INTENT_LABELS[intent]} 관련 문의예요`)}
              className="rounded-full border border-clarify-line bg-surface px-3 py-1.5 text-xs text-content transition-colors hover:border-clarify disabled:cursor-not-allowed disabled:opacity-50"
            >
              {INTENT_LABELS[intent]}
            </button>
          </li>
        ))}
      </ul>
      <Button variant="secondary" className="mt-3" onClick={onEscalate}>
        상담원 연결
      </Button>
    </section>
  );
}
