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

const layerRules = LAYERS.map((layer, index) => ({
  from: [layer],
  allow: LAYERS.slice(index + 1).map((lower) => [lower, { slice: "*" }]),
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
        { type: "app", pattern: "app/**/*", mode: "full", capture: ["_"] },
        { type: "views", pattern: "src/views/*", capture: ["slice"] },
        { type: "widgets", pattern: "src/widgets/*", capture: ["slice"] },
        { type: "features", pattern: "src/features/*", capture: ["slice"] },
        { type: "entities", pattern: "src/entities/*", capture: ["slice"] },
        // shared 는 슬라이스가 없는 공용 레이어라 내부 세그먼트끼리 자유롭게 참조한다
        { type: "shared", pattern: "src/shared/**/*", mode: "full" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          message: "FSD 레이어 규칙 위반: ${file.type} 에서 ${dependency.type} 을 import 할 수 없다",
          rules: [
            ...layerRules,
            // 같은 슬라이스 내부 파일끼리는 허용
            {
              from: [["views", { slice: "${from.slice}" }]],
              allow: [["views", { slice: "${from.slice}" }]],
            },
            {
              from: [["widgets", { slice: "${from.slice}" }]],
              allow: [["widgets", { slice: "${from.slice}" }]],
            },
            {
              from: [["features", { slice: "${from.slice}" }]],
              allow: [["features", { slice: "${from.slice}" }]],
            },
            {
              from: [["entities", { slice: "${from.slice}" }]],
              allow: [["entities", { slice: "${from.slice}" }]],
            },
            { from: ["shared"], allow: ["shared"] },
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
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
