interface BooleanIndicatorProps {
  label: string;
  value: boolean;
}

/** 긴급 / 이관필요 같은 yes-no 판정 표시 (● / ○) */
export function BooleanIndicator({ label, value }: BooleanIndicatorProps) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-content-muted">{label}</span>
      <span
        className={`flex items-center gap-1 font-medium ${
          value ? "text-escalate-strong" : "text-content-muted"
        }`}
      >
        <span aria-hidden="true">{value ? "●" : "○"}</span>
        {value ? "YES" : "NO"}
      </span>
    </div>
  );
}
