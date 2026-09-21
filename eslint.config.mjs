import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * FSD 레이어 의존 규칙 (docs/02-화면명세서.md 1.2)
 * app → views → widgets → features → entities → shared
 * - 아래 방향으로만 import
 * - 같은 레이어 내 슬라이스끼리 직접 import 금지
 */
const LAYERS = ["app", "views", "widgets", "features", "entities", "shared"];

/** 슬라이스로 나뉘는 레이어 (shared 와 app 은 슬라이스가 없다) */
const SLICED_LAYERS = ["views", "widgets", "features", "entities"];

/** 자기보다 아래 레이어는 슬라이스를 가리지 않고 import 할 수 있다. */
const downwardPolicies = LAYERS.slice(0, -1).map((layer, index) => ({
  from: { element: { type: layer } },
  allow: { to: { element: { types: { anyOf: LAYERS.slice(index + 1) } } } },
}));

/** 같은 레이어에서는 자기 슬라이스 내부만 참조할 수 있다. */
const sameSlicePolicies = SLICED_LAYERS.map((layer) => ({
  from: { element: { type: layer } },
  allow: {
    to: { element: { type: layer, captured: { slice: "{{from.slice}}" } } },
  },
}));

/** 슬라이스가 없는 레이어는 내부 참조를 자유롭게 둔다. */
const flatLayerPolicies = ["app", "shared"].map((layer) => ({
  from: { element: { type: layer } },
  allow: { to: { element: { type: layer } } },
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["app/**/*", "src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "app/**/*", partialMatch: false },
        { type: "views", pattern: "src/views/*", capture: ["slice"] },
        { type: "widgets", pattern: "src/widgets/*", capture: ["slice"] },
        { type: "features", pattern: "src/features/*", capture: ["slice"] },
        { type: "entities", pattern: "src/entities/*", capture: ["slice"] },
        // shared 는 슬라이스가 없는 공용 레이어라 내부 세그먼트끼리 자유롭게 참조한다
        { type: "shared", pattern: "src/shared/**/*", partialMatch: false },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "FSD 레이어 규칙 위반: {{from.type}} 에서 {{to.type}} 을 import 할 수 없다",
          policies: [...downwardPolicies, ...sameSlicePolicies, ...flatLayerPolicies],
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Jev 호출은 서버 Route Handler 에서만. 클라이언트 번들에 키가 새면 안 된다.
    files: ["**/*.{ts,tsx}"],
    ignores: ["app/api/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/jev.server"],
              message:
                "Jev 호출은 app/api/voc/route.ts 에서만 한다. (docs/01-기획명세서.md 5.5)",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "types/**",
  ]),
]);

export default eslintConfig;
