/**
 * 판정·라우팅에 쓰이는 임계값 상수.
 * 매직넘버 금지 — 실측 후 여기서만 조정한다. (docs/01-기획명세서.md 5.4)
 */

/** intent.confidence 가 이 값 "이상"이면 자동응답으로 통과한다. */
export const CONFIDENCE_THRESHOLD = 0.7;

/** frustration.score 가 이 값 이상이면 confidence 와 무관하게 즉시 이관한다. */
export const FRUSTRATION_ESCALATE_LEVEL = 2;

/** noul 확률이 이 값 이상이면 yes 로 해석한다. */
export const NOUL_TRUE_THRESHOLD = 0.5;

/** Jev 호출 총 제한 시간(ms). 초과하면 ESCALATE 로 폴백한다. */
export const JEV_TIMEOUT_MS = 5_000;

/** 문의 입력 길이 제한 */
export const MESSAGE_MIN_LENGTH = 2;
export const MESSAGE_MAX_LENGTH = 2_000;

/** 불만도 레벨의 최댓값 (0/1/2 세그먼트 바 렌더에 사용) */
export const FRUSTRATION_MAX_LEVEL = 2;
