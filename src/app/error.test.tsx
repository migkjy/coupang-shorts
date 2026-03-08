import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorPage from "./error";

describe("ErrorPage", () => {
  it("renders error heading", () => {
    const mockReset = vi.fn();
    render(
      <ErrorPage
        error={new Error("test error") as Error & { digest?: string }}
        reset={mockReset}
      />
    );
    expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument();
  });

  it("displays error message", () => {
    const mockReset = vi.fn();
    render(
      <ErrorPage
        error={new Error("custom error msg") as Error & { digest?: string }}
        reset={mockReset}
      />
    );
    expect(screen.getByText("custom error msg")).toBeInTheDocument();
  });

  it("renders retry button", () => {
    const mockReset = vi.fn();
    render(
      <ErrorPage
        error={new Error("test") as Error & { digest?: string }}
        reset={mockReset}
      />
    );
    expect(screen.getByText("다시 시도")).toBeInTheDocument();
  });
});
