import { CONFIDENCE_THRESHOLD } from "@/shared/config";

export interface ProbabilityEntry {
  label: string;
  value: number;
}

/** confidence 가 임계값을 통과했는지. UI 는 이 결과만 보고 경고 스타일을 정한다. */
export function isConfidencePassing(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLD;
}

/** 확률 맵을 내림차순 배열로 바꾼다. 같은 값이면 라벨 사전순으로 안정화한다. */
export function sortProbabilities(
  probabilities: Record<string, number>,
): ProbabilityEntry[] {
  return Object.entries(probabilities)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}
