import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pipeline/logs",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
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
    // "성공" appears in multiple places (summary card + filter button + table)
    const successElements = screen.getAllByText("성공");
    expect(successElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders log entries in table", () => {
    render(<LogsDashboardPage />);
    const entries = screen.getAllByText("삼성 갤럭시 버즈3 프로");
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });
});
