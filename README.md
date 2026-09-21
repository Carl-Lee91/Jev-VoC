# jev-voc-bot

TypeSafe AI의 **Jev(System One Model)** 로 VOC 문의를 판정하고, 결과에 따라 FAQ 템플릿으로 답변하거나 상담원에게 이관하는 웹 상담봇.

> **Jev는 텍스트를 생성하지 않는다.** 출력은 `choice` / `score` / `noul` 세 타입의 확률값뿐이다.
> 고객에게 나가는 문장은 Phase 1에서 전부 FAQ 템플릿이 담당한다.

## 설치와 실행

```bash
pnpm install
cp .env.example .env.local   # TYPESAFE_API_KEY 채우기 (서버 전용, NEXT_PUBLIC_ 금지)
pnpm dev
```

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 (타입 검사 포함) |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm test` | Vitest watch |
| `pnpm test:run` | Vitest 1회 실행 |
| `pnpm test:coverage` | 커버리지 |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm lint` | ESLint (FSD 레이어 규칙 포함) |

E2E를 처음 돌린다면 `pnpm exec playwright install chromium` 이 필요하다.

## 구조

FSD(Feature-Sliced Design)를 쓰되, FSD의 `pages` 레이어는 Next.js `app/`과 충돌하므로 `src/views/`로 리네이밍했다.

```
app → src/views → src/widgets → src/features → src/entities → src/shared
```

아래 방향으로만 import 하며, 같은 레이어 슬라이스끼리의 직접 import는 `eslint-plugin-boundaries`로 막는다.

| 위치 | 역할 |
| --- | --- |
| `app/api/voc/route.ts` | Jev를 호출하는 유일한 지점 (`runtime = 'nodejs'`) |
| `src/entities/verdict` | 라우팅 정책·confidence 해석 순수 함수 |
| `src/entities/ticket` | 티켓 정렬·필터 |
| `src/shared/api/jev.server.ts` | 서버 전용 Jev 클라이언트 (배럴에 재노출하지 않는다) |
| `src/shared/config/thresholds.ts` | confidence 임계값 등 상수 |
| `src/shared/config/faq.ts` | 의도별 FAQ 템플릿 |

## 설계 규칙

- 판정 해석·라우팅 결정·우선순위 계산은 컴포넌트 밖 순수 함수에 둔다. 컴포넌트는 결과를 렌더만 한다.
- `TYPESAFE_API_KEY`는 서버 전용이다. 클라이언트에서 Jev를 직접 부르지 않는다.
- Jev 장애는 5xx로 내보내지 않고 `ESCALATE` 분기로 정상 응답한다.
- `entities/verdict`, `entities/ticket`의 라우팅·우선순위 로직은 커버리지 100%를 유지한다.

## 문서

- [기획 명세서](docs/01-기획명세서.md)
- [화면 명세서](docs/02-화면명세서.md)
- [테스트 케이스](docs/03-테스트케이스.md)
