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
