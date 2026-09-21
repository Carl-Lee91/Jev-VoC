# CLAUDE.md — jev-voc-bot

이 파일은 이 저장소에서 작업하는 Claude Code에게 주는 지침이다.

## 0. 시작하기 전에 반드시 읽을 것

아래 순서로 전부 읽고 시작한다. 추측으로 구현하지 않는다.

1. `docs/01-기획명세서.md` — 무엇을 왜 만드는지, Jev 연동 명세, 라우팅 정책
2. `docs/02-화면명세서.md` — FSD 폴더 구조, 화면별 상세, API 계약
3. `docs/03-테스트케이스.md` — 테스트 전략과 케이스 목록, 완료 조건

## 1. 기본 규칙

- **한국말로 대답할 것**
- **UI와 Business Logic을 분리할 것** — 판정 해석·라우팅 결정·우선순위 계산은 컴포넌트 밖 순수 함수로 둔다
- 최근 업데이트가 1년이 지난 패키지는 사용하지 않을 것
- 패키지를 추천할 때는 npm 최신 릴리스 날짜를 확인할 것

## 2. 이 프로젝트의 핵심 전제

> **Jev는 텍스트를 생성하지 않는다.** LLM이 아니다.
> 출력은 `choice` / `score` / `noul` 세 가지 타입의 확률값뿐이다.
> 고객에게 보낼 답변 문장은 Jev가 만들지 않는다 — Phase 1에서는 FAQ 템플릿이 담당한다.

Jev에게 문장을 생성시키려는 코드를 쓰고 있다면 설계가 틀린 것이다.

## 3. 아키텍처: FSD (Feature-Sliced Design)

```
app → src/views → src/widgets → src/features → src/entities → src/shared
```

- 위에서 아래로만 import. **역방향 import 금지**
- 같은 레이어 내 슬라이스끼리 직접 import 금지
- 각 슬라이스는 `index.ts`로 public API를 노출하고, 외부에서 내부 경로를 직접 참조하지 않는다
- FSD의 `pages` 레이어는 Next.js `app/`과 충돌하므로 **`src/views/`로 리네이밍**해서 쓴다
- Next.js `app/`은 라우팅 전용으로 얇게 유지한다

전체 폴더 구조는 `docs/02-화면명세서.md` 1장 참조.

## 4. 테스트 — 타협 없음

- **기능을 만들면 테스트를 같이 만든다.** 나중으로 미루지 않는다
- Jev 실 API는 테스트에서 절대 호출하지 않는다 (MSW / 모듈 모킹)
- `entities/verdict`, `entities/ticket`의 라우팅·우선순위 로직은 **커버리지 100%**
- 라우팅 정책이 DOM 없이 단위 테스트되지 않는다면, UI/로직 분리가 실패한 것이므로 설계를 고친다
- 테스트 이름은 한국어 서술형으로 쓴다

케이스 목록과 완료 조건은 `docs/03-테스트케이스.md` 참조.

## 5. 보안 제약 (위반 금지)

- `TYPESAFE_API_KEY`는 **서버 전용**. `NEXT_PUBLIC_` 접두사 절대 금지
- Jev 호출은 `app/api/voc/route.ts`에서만. 클라이언트에서 직접 호출 금지
- Route Handler에 `export const runtime = 'nodejs'` 명시 (Edge 지원 여부 미확인)
- `.env.local`은 커밋하지 않는다

## 6. Jev SDK 사용 시 주의

`choice()`의 시그니처는 공식 문서로 확인됐다.

```ts
import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const response = await client.systemOne({
  state: { document: "..." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});
response.answers.category.choice; // "billing"
```

**그러나 `score()` / `noul()`의 JS 헬퍼 인자 형태는 확정하지 못했다.**
구현 시 `pnpm add @typesafe-ai/sdk` 후 `node_modules/@typesafe-ai/sdk`의 `.d.ts`를 직접 읽어 확정할 것. **추측해서 작성하지 말 것.**

## 7. 기술 스택

| 구분          | 선택                                              |
| ------------- | ------------------------------------------------- |
| 프레임워크    | Next.js 15 (App Router)                           |
| 언어          | TypeScript strict (`any` 금지)                    |
| 상태관리      | Zustand                                           |
| 폼            | React Hook Form + Yup                             |
| 스타일        | Tailwind CSS (하드코딩 hex 금지, 의미 토큰 사용)  |
| HTTP          | Axios + SWR                                       |
| 테스트        | Vitest + React Testing Library + MSW + Playwright |
| 패키지 매니저 | pnpm                                              |

## 8. 명령어

```bash
pnpm install
pnpm dev
pnpm build
pnpm type-check        # tsc --noEmit
pnpm test              # Vitest watch
pnpm test:run          # 1회 실행
pnpm test:coverage
pnpm test:e2e          # Playwright
```

## 9. 코딩 컨벤션

- 컴포넌트 PascalCase / 함수·변수 camelCase / 상수 UPPER_SNAKE_CASE
- 파일: 컴포넌트는 PascalCase, 그 외 kebab-case
- 한 컴포넌트는 한 파일. 슬라이스 `index.ts`에 export 추가
- `_buildXxx` 같은 private 빌드 함수로 UI를 쪼개지 말고 별도 컴포넌트로 분리
- 서버 컴포넌트를 기본으로 하고, 필요한 곳에만 `'use client'`
- 매직넘버 금지 — 임계값은 `shared/config/thresholds.ts`에 상수로

## 10. 커밋 파편화 규칙

같은 작업이라도 성격이 다르면 **별도 커밋**으로 쪼갤 것. 커밋 메시지 prefix:

- `Feat:` 새 기능 추가 (예: `Feat: add matching scroll sync`)
- `Refactor:` 기능 변경 없이 구조 개선 (예: `Refactor: split host_register widgets`)
- `Style:` UI/스타일/포매팅 변경 (예: `Style: tweak matching card spacing`)
- `Fix:` 버그 수정 (예: `Fix: prevent special chars in club name`)
- `Test:` 테스트 추가/수정 (예: `Test: add club name filter test`)
- `Chore:` 빌드/설정/문서 등 잡일 (예: `Chore: bump go_router`)
- `Docs:` 문서 변경 (예: `Docs: update README`)

예시: 매칭 스크롤 기능 구현 시

```
Feat: add matching scroll sync logic
Style: add matching scroll UI
Test: add matching scroll widget test
```

(한 커밋에 Feat + Style + Test 를 섞지 말 것)

## 11. 구현 순서 권장

1. 프로젝트 초기화 (Next.js + TS + Tailwind + Vitest + Playwright)
2. FSD 폴더 스캐폴딩 + 레이어 import 규칙 린트 설정
3. `entities/verdict` 라우팅 정책 순수 함수 **+ 단위 테스트 (TC-U-01~15)** ← 여기부터 테스트 동반
4. `shared/config/faq`, `thresholds` + 테스트 (TC-U-16~17)
5. `shared/api/jev.server.ts` + `app/api/voc/route.ts` + 통합 테스트 (TC-I-01~09)
6. `features/send-inquiry` + 컴포넌트 테스트 (TC-C-01~07)
7. `widgets/chat-panel`, `verdict-inspector` + 테스트 (TC-C-08~22)
8. `widgets/ticket-table` + `views/tickets` + 테스트 (TC-C-23~26)
9. E2E (TC-E-01~07)
