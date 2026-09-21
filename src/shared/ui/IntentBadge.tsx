import { INTENT_BADGE_CLASS, INTENT_LABELS } from "../config/display";
import { isIntent } from "../model/voc";

interface IntentBadgeProps {
  intent: string;
}

/** 의도 배지. 스펙 밖 값이 와도 기타 스타일로 떨어뜨리고 원문을 보여준다. */
export function IntentBadge({ intent }: IntentBadgeProps) {
  const known = isIntent(intent);
  const className = known ? INTENT_BADGE_CLASS[intent] : INTENT_BADGE_CLASS.etc;
  const label = known ? INTENT_LABELS[intent] : intent;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}
