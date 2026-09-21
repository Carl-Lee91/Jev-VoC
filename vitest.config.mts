import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const FULL_COVERAGE = {
  lines: 100,
  functions: 100,
  branches: 100,
  statements: 100,
};

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "app/**/*.test.ts"],
    exclude: ["node_modules/**", "e2e/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}", "app/api/**/*.ts"],
      exclude: ["**/index.ts", "**/*.test.{ts,tsx}", "**/*.d.ts"],
      thresholds: {
        lines: 80,
        // docs/03-테스트케이스.md 1.3 — 라우팅·우선순위 로직은 예외 없이 100%
        "src/entities/verdict/**": FULL_COVERAGE,
        "src/entities/ticket/**": FULL_COVERAGE,
      },
    },
  },
});
