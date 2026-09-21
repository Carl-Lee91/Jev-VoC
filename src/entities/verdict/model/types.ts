import type { Priority, RouteAction } from "@/shared/model";

/** 라우팅 정책의 판단 결과. reason 은 인스펙터에 그대로 노출된다. */
export interface RouteDecision {
  action: RouteAction;
  priority: Priority;
  reason: string;
}
