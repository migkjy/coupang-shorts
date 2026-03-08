import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
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
