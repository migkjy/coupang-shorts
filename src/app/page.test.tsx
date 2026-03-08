import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("renders the hero heading", () => {
    render(<DashboardPage />);
    expect(
      screen.getByRole("heading", { name: /쿠팡파트너스 쇼츠 자동화/ })
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
