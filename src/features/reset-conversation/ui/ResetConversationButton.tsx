"use client";

import { Button } from "@/shared/ui";

interface ResetConversationButtonProps {
  onReset: () => void;
  disabled?: boolean;
}

export function ResetConversationButton({
  onReset,
  disabled = false,
}: ResetConversationButtonProps) {
  return (
    <Button variant="secondary" onClick={onReset} disabled={disabled}>
      대화 초기화
    </Button>
  );
}
