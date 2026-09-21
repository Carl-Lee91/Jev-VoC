import axios from "axios";

import type { VocRequest, VocResponse } from "./voc-contract";

/**
 * 브라우저에서 /api/voc 를 호출한다.
 * Jev 는 서버에서만 부르므로 이 클라이언트는 우리 Route Handler 만 바라본다.
 */
export async function requestVocVerdict(message: string): Promise<VocResponse> {
  const body: VocRequest = { message };
  const { data } = await axios.post<VocResponse>("/api/voc", body);
  return data;
}
