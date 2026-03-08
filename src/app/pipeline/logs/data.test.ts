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
