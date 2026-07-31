import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  attachRequest,
  clearPerformanceTelemetry,
  completeFlow,
  endSpan,
  failFlow,
  getFlowCounters,
  getRecentSpans,
  mark,
  measure,
  recordDuplicateRequest,
  recordResponseHeaders,
  startFlow,
  startLoginToPulseSpan,
  endLoginToPulseSpan,
  startSpan,
} from "@/lib/telemetry/performanceTelemetry";

describe("performanceTelemetry", () => {
  beforeEach(() => {
    clearPerformanceTelemetry();
    vi.stubGlobal("performance", {
      now: vi.fn(() => 1000),
      mark: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("records span duration on end", () => {
    const perf = performance as unknown as { now: ReturnType<typeof vi.fn> };
    perf.now.mockReturnValueOnce(1000).mockReturnValueOnce(1250);

    const spanId = startSpan("bootstrap.load", { force: true });
    const completed = endSpan(spanId);

    expect(completed?.name).toBe("bootstrap.load");
    expect(completed?.durationMs).toBe(250);
    expect(getRecentSpans()[0]?.metadata).toEqual({ force: true });
  });

  it("attaches response headers to an active span", () => {
    const spanId = startSpan("quick_add.save");
    const response = new Response(null, {
      headers: {
        "X-Request-ID": "req-123",
        "X-Duration-Ms": "42.5",
        "X-Cache-Hit": "true",
        "X-Projection-Version": "7",
      },
    });
    recordResponseHeaders(response, spanId);
    const completed = endSpan(spanId);

    expect(completed?.requestId).toBe("req-123");
    expect(completed?.serverDurationMs).toBe(42.5);
    expect(completed?.serverCacheHit).toBe(true);
    expect(completed?.projectionVersion).toBe(7);
  });

  it("tracks login.to_pulse as a single session span", () => {
    const perf = performance as unknown as { now: ReturnType<typeof vi.fn> };
    perf.now.mockReturnValueOnce(1000).mockReturnValueOnce(1700);

    startLoginToPulseSpan();
    startLoginToPulseSpan();

    const completed = endLoginToPulseSpan();
    expect(completed?.name).toBe("login.to_pulse");
    expect(completed?.durationMs).toBe(700);
    expect(endLoginToPulseSpan()).toBeNull();
  });

  it("tracks flow lifecycle marks and measures", () => {
    const perf = performance as unknown as { now: ReturnType<typeof vi.fn> };
    let t = 1000;
    perf.now.mockImplementation(() => {
      t += 50;
      return t;
    });

    const flowId = startFlow("setup.resume", { context: "BUSINESS" });
    mark(flowId, "shell_painted");
    mark(flowId, "content_rendered");
    attachRequest(flowId, "req-a");
    const duration = measure(flowId, "shell_painted", "content_rendered");
    expect(duration).toBeGreaterThanOrEqual(0);
    const completed = completeFlow(flowId);
    expect(completed?.success).toBe(true);
    expect(completed?.requestIds).toContain("req-a");
    expect(completed?.marks.some((m) => m.event === "flow_started")).toBe(true);
  });

  it("failFlow records error code", () => {
    const flowId = startFlow("quick_add.personal.expense");
    const failed = failFlow(flowId, "network_error");
    expect(failed?.success).toBe(false);
    expect(failed?.errorCode).toBe("network_error");
  });

  it("detects duplicate request fingerprints", () => {
    recordDuplicateRequest("GET:/api/v1/personal/pulse");
    recordDuplicateRequest("GET:/api/v1/personal/pulse");
    expect(getFlowCounters().duplicateRequests).toBe(1);
  });
});
