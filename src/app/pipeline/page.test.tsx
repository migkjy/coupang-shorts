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
