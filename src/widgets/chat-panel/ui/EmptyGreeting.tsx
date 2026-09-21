import { CHAT_COPY, EXAMPLE_INQUIRIES } from "@/shared/config";

interface EmptyGreetingProps {
  onSelectExample: (message: string) => void;
  disabled?: boolean;
}

/** 최초 진입 화면 — 인사말 + 예시 문의 칩 (docs/02-화면명세서.md S-01) */
export function EmptyGreeting({ onSelectExample, disabled = false }: EmptyGreetingProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-content">
        {CHAT_COPY.greeting}
      </div>
      <ul className="flex flex-wrap gap-2">
        {EXAMPLE_INQUIRIES.map((example) => (
          <li key={example}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelectExample(example)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-content-muted transition-colors hover:border-line-strong hover:text-content disabled:cursor-not-allowed disabled:opacity-50"
            >
              {example}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
