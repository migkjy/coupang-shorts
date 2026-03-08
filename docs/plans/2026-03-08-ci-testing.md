# Coupang Shorts CI + Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add vitest unit tests for all Next.js dashboard pages/API + GitHub Actions CI pipeline.

**Architecture:** vitest + @testing-library/react + jsdom for component tests. API route tests use direct function import. GitHub Actions runs build + test on PR/push.

**Tech Stack:** vitest, @testing-library/react, @testing-library/jest-dom, jsdom

---

### Task 1: Install test dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install vitest + testing-library**

```bash
cd /Users/nbs22/\(Claude\)/\(claude\).projects/business-builder/projects/coupang-shorts
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

**Step 2: Add test scripts to package.json**

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add vitest + testing-library dev dependencies"
```

---

### Task 2: Create vitest config

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Step 1: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 2: Create test setup file**

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
```

**Step 3: Run vitest to verify config**

```bash
npx vitest run
```

Expected: "No test files found" (no tests yet), no config errors.

**Step 4: Commit**

```bash
git add vitest.config.ts src/test/setup.ts
git commit -m "chore: add vitest config + test setup"
```

---

### Task 3: Test data.ts (PipelineLog structure)

**Files:**
- Create: `src/app/pipeline/logs/data.test.ts`

**Step 1: Write the test**

```typescript
import { describe, it, expect } from "vitest";
import { sampleLogs, type PipelineLog } from "./data";

describe("sampleLogs data", () => {
  it("exports a non-empty array of logs", () => {
    expect(Array.isArray(sampleLogs)).toBe(true);
    expect(sampleLogs.length).toBeGreaterThan(0);
  });

  it("each log has required fields", () => {
    const requiredKeys: (keyof PipelineLog)[] = [
      "id",
      "productName",
      "productId",
      "status",
      "stage",
      "startedAt",
    ];
    for (const log of sampleLogs) {
      for (const key of requiredKeys) {
        expect(log).toHaveProperty(key);
      }
    }
  });

  it("status values are valid", () => {
    const validStatuses = ["success", "failed", "processing"];
    for (const log of sampleLogs) {
      expect(validStatuses).toContain(log.status);
    }
  });

  it("stage values are valid", () => {
    const validStages = ["fetch", "script", "render", "upload", "complete"];
    for (const log of sampleLogs) {
      expect(validStages).toContain(log.stage);
    }
  });

  it("failed logs have error messages", () => {
    const failedLogs = sampleLogs.filter((l) => l.status === "failed");
    expect(failedLogs.length).toBeGreaterThan(0);
    for (const log of failedLogs) {
      expect(log.error).toBeTruthy();
    }
  });

  it("success logs have estimatedRevenue", () => {
    const successLogs = sampleLogs.filter((l) => l.status === "success");
    for (const log of successLogs) {
      expect(log.estimatedRevenue).toBeGreaterThan(0);
    }
  });
});
```

**Step 2: Run test to verify it passes**

```bash
npx vitest run src/app/pipeline/logs/data.test.ts
```

Expected: All 6 tests PASS.

**Step 3: Commit**

```bash
git add src/app/pipeline/logs/data.test.ts
git commit -m "test: add data.ts structure validation tests"
```

---

### Task 4: Test API route /api/logs

**Files:**
- Create: `src/app/api/logs/route.test.ts`

**Step 1: Write the test**

```typescript
import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/logs", () => {
  it("returns JSON with logs array", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("logs");
    expect(Array.isArray(body.logs)).toBe(true);
    expect(body.logs.length).toBeGreaterThan(0);
  });

  it("each log has id and productName", async () => {
    const response = await GET();
    const body = await response.json();
    for (const log of body.logs) {
      expect(log.id).toBeTruthy();
      expect(log.productName).toBeTruthy();
    }
  });
});
```

**Step 2: Run test**

```bash
npx vitest run src/app/api/logs/route.test.ts
```

Expected: PASS.

**Step 3: Commit**

```bash
git add src/app/api/logs/route.test.ts
git commit -m "test: add /api/logs GET route tests"
```

---

### Task 5: Test Dashboard page (/)

**Files:**
- Create: `src/app/page.test.tsx`

**Step 1: Write the test**

Note: This page is a Server Component (no "use client"), so render directly.

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("renders the hero heading", () => {
    render(<DashboardPage />);
    expect(
      screen.getByText("쿠팡파트너스 쇼츠 자동화")
    ).toBeInTheDocument();
  });

  it("renders pipeline steps", () => {
    render(<DashboardPage />);
    expect(screen.getByText("파이프라인 현황")).toBeInTheDocument();
    expect(screen.getByText("트렌딩 발굴")).toBeInTheDocument();
    expect(screen.getByText("영상 렌더링")).toBeInTheDocument();
  });

  it("renders recent videos table", () => {
    render(<DashboardPage />);
    expect(screen.getByText("최근 생성 영상")).toBeInTheDocument();
    expect(
      screen.getByText("에어팟 프로 2 — 이 가격 실화?")
    ).toBeInTheDocument();
  });

  it("renders settings section", () => {
    render(<DashboardPage />);
    expect(screen.getByText("설정 현황")).toBeInTheDocument();
    expect(screen.getByText("쿠팡파트너스 API")).toBeInTheDocument();
  });
});
```

**Step 2: Run test**

```bash
npx vitest run src/app/page.test.tsx
```

Expected: PASS.

**Step 3: Commit**

```bash
git add src/app/page.test.tsx
git commit -m "test: add dashboard page render tests"
```

---

### Task 6: Test Demo page (/demo)

**Files:**
- Create: `src/app/demo/page.test.tsx`

**Step 1: Write the test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DemoPage from "./page";

describe("DemoPage", () => {
  it("renders heading", () => {
    render(<DemoPage />);
    expect(screen.getByText("영상 데모 미리보기")).toBeInTheDocument();
  });

  it("renders product names", () => {
    render(<DemoPage />);
    // PhoneFrame renders productName inside
    const names = screen.getAllByText("Apple 에어팟 프로 2세대");
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  it("renders scene breakdown", () => {
    render(<DemoPage />);
    expect(screen.getByText("씬 구성 (40초)")).toBeInTheDocument();
    expect(screen.getByText("Hook")).toBeInTheDocument();
    expect(screen.getByText("CTA")).toBeInTheDocument();
  });
});
```

**Step 2: Run test**

```bash
npx vitest run src/app/demo/page.test.tsx
```

**Step 3: Commit**

```bash
git add src/app/demo/page.test.tsx
git commit -m "test: add demo page render tests"
```

---

### Task 7: Test Pipeline page (/pipeline)

**Files:**
- Create: `src/app/pipeline/page.test.tsx`

**Step 1: Write the test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PipelinePage from "./page";

describe("PipelinePage", () => {
  it("renders heading", () => {
    render(<PipelinePage />);
    expect(screen.getByText("파이프라인 구조")).toBeInTheDocument();
  });

  it("renders all 6 pipeline steps", () => {
    render(<PipelinePage />);
    expect(screen.getByText("트렌딩 상품 발굴")).toBeInTheDocument();
    expect(screen.getByText("AI 스크립트 생성")).toBeInTheDocument();
    expect(screen.getByText("TTS 음성 합성")).toBeInTheDocument();
    expect(screen.getByText("Remotion 영상 렌더링")).toBeInTheDocument();
    expect(screen.getByText("자동 업로드")).toBeInTheDocument();
    expect(screen.getByText("성과 분석")).toBeInTheDocument();
  });

  it("renders video spec section", () => {
    render(<PipelinePage />);
    expect(screen.getByText("영상 스펙")).toBeInTheDocument();
    expect(screen.getByText("1080 x 1920 (9:16)")).toBeInTheDocument();
  });

  it("renders pipeline command", () => {
    render(<PipelinePage />);
    expect(screen.getByText("npm run pipeline")).toBeInTheDocument();
  });
});
```

**Step 2: Run test, commit**

```bash
npx vitest run src/app/pipeline/page.test.tsx
git add src/app/pipeline/page.test.tsx
git commit -m "test: add pipeline page render tests"
```

---

### Task 8: Test Nav component

**Files:**
- Create: `src/app/nav.test.tsx`

**Step 1: Write the test**

Nav uses `usePathname` from next/navigation — mock it.

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import Nav from "./nav";

describe("Nav", () => {
  it("renders brand name", () => {
    render(<Nav />);
    expect(screen.getByText("쿠팡쇼츠 자동화")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(<Nav />);
    expect(screen.getByText("대시보드")).toBeInTheDocument();
    expect(screen.getByText("파이프라인")).toBeInTheDocument();
    expect(screen.getByText("실행 로그")).toBeInTheDocument();
    expect(screen.getByText("데모")).toBeInTheDocument();
  });

  it("marks current page with aria-current", () => {
    render(<Nav />);
    const dashboardLink = screen.getByText("대시보드");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });
});
```

**Step 2: Run test, commit**

```bash
npx vitest run src/app/nav.test.tsx
git add src/app/nav.test.tsx
git commit -m "test: add nav component tests"
```

---

### Task 9: Test Pipeline Logs page (/pipeline/logs)

**Files:**
- Create: `src/app/pipeline/logs/page.test.tsx`

**Step 1: Write the test**

This is a "use client" component with state. Mock next modules.

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pipeline/logs",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import LogsDashboardPage from "./page";

describe("LogsDashboardPage", () => {
  it("renders heading", () => {
    render(<LogsDashboardPage />);
    expect(screen.getByText("실행 로그")).toBeInTheDocument();
  });

  it("renders summary cards", () => {
    render(<LogsDashboardPage />);
    expect(screen.getByText("총 실행")).toBeInTheDocument();
    expect(screen.getByText("성공률")).toBeInTheDocument();
    expect(screen.getByText("총 예상 수익")).toBeInTheDocument();
    expect(screen.getByText("최근 실행")).toBeInTheDocument();
  });

  it("renders filter buttons", () => {
    render(<LogsDashboardPage />);
    expect(screen.getByText("전체")).toBeInTheDocument();
    expect(screen.getByText("성공")).toBeInTheDocument();
    expect(screen.getByText("실패")).toBeInTheDocument();
    expect(screen.getByText("진행중")).toBeInTheDocument();
  });

  it("renders log entries in table", () => {
    render(<LogsDashboardPage />);
    // Check a known product name from sample data
    expect(screen.getByText("삼성 갤럭시 버즈3 프로")).toBeInTheDocument();
  });
});
```

**Step 2: Run test, commit**

```bash
npx vitest run src/app/pipeline/logs/page.test.tsx
git add src/app/pipeline/logs/page.test.tsx
git commit -m "test: add pipeline logs page tests"
```

---

### Task 10: Test not-found and error pages

**Files:**
- Create: `src/app/not-found.test.tsx`
- Create: `src/app/error.test.tsx`

**Step 1: Write not-found test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders 404 text", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders message", () => {
    render(<NotFound />);
    expect(
      screen.getByText("페이지를 찾을 수 없습니다")
    ).toBeInTheDocument();
  });

  it("renders link back to dashboard", () => {
    render(<NotFound />);
    const link = screen.getByText("대시보드로 돌아가기");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });
});
```

**Step 2: Write error page test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorPage from "./error";

describe("ErrorPage", () => {
  it("renders error heading", () => {
    const mockReset = vi.fn();
    render(
      <ErrorPage error={new Error("test error") as any} reset={mockReset} />
    );
    expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument();
  });

  it("displays error message", () => {
    const mockReset = vi.fn();
    render(
      <ErrorPage error={new Error("custom error msg") as any} reset={mockReset} />
    );
    expect(screen.getByText("custom error msg")).toBeInTheDocument();
  });

  it("renders retry button", () => {
    const mockReset = vi.fn();
    render(
      <ErrorPage error={new Error("test") as any} reset={mockReset} />
    );
    expect(screen.getByText("다시 시도")).toBeInTheDocument();
  });
});
```

**Step 3: Run tests, commit**

```bash
npx vitest run src/app/not-found.test.tsx src/app/error.test.tsx
git add src/app/not-found.test.tsx src/app/error.test.tsx
git commit -m "test: add not-found + error page tests"
```

---

### Task 11: Run all tests + verify

**Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass (9 test files, ~25+ tests).

---

### Task 12: Create GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create CI workflow**

```yaml
name: CI

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - run: npm test
```

**Step 2: Commit everything**

```bash
git add .github/workflows/ci.yml
git commit -m "feat(ci): add vitest tests + GitHub Actions CI pipeline"
```

---

### Task 13: Push + verify

**Step 1: Pull rebase then push**

```bash
git pull --rebase origin main
git push origin main
```

**Step 2: Verify CI runs on GitHub**

Check GitHub Actions tab for green build.
