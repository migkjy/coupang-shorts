import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
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
