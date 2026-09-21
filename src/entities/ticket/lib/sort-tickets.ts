import type { Priority } from "@/shared/model";

import type { Ticket } from "../model/types";

/** 값이 작을수록 위로 올라온다. */
const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

/**
 * 우선순위 high 를 먼저, 같은 우선순위끼리는 최신순으로 정렬한다.
 * (docs/02-화면명세서.md S-03)
 *
 * 입력 배열을 변형하지 않고 새 배열을 돌려준다.
 */
export function sortTickets(tickets: readonly Ticket[]): Ticket[] {
  return [...tickets].sort((a, b) => {
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) {
      return byPriority;
    }
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}
