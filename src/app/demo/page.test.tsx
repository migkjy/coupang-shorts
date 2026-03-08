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
