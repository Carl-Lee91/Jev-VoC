interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = "처리 중" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-block size-4 animate-spin rounded-full border-2 border-line-strong border-t-content"
    />
  );
}
