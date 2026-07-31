/** Debug performance spans — not product analytics. */

export type PerformanceSpanName =
  | "bootstrap.load"
  | "login.to_pulse"
  | "context.switch"
  | "quick_add.save"
  | "pulse.refresh"
  | "pulse.time_to_visible"
  | "template.moments.load"
  | "template.pulse.load"
  | "template.life.load"
  | "template.memory.load"
  | "template.moment.archive"
  | "template.moment.complete"
  | "business_setup_create"
  | "business_setup_get"
  | "business_setup_first_paint"
  | "business_setup_bootstrap_refresh"
  | "business_setup_total_open";

export type PerformanceSpan = {
  id: string;
  name: PerformanceSpanName;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  requestId?: string;
  serverDurationMs?: number;
  serverCacheHit?: boolean;
  projectionVersion?: number;
  metadata?: Record<string, unknown>;
};

const activeSpans = new Map<string, PerformanceSpan>();
const completedSpans: PerformanceSpan[] = [];
const MAX_COMPLETED = 100;

let loginToPulseSpanId: string | null = null;
let quickAddSaveSpanId: string | null = null;

function pushCompleted(span: PerformanceSpan): void {
  completedSpans.unshift(span);
  if (completedSpans.length > MAX_COMPLETED) {
    completedSpans.length = MAX_COMPLETED;
  }
}

export function startSpan(
  name: PerformanceSpanName,
  metadata?: Record<string, unknown>,
): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `span-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  activeSpans.set(id, {
    id,
    name,
    startedAt: performance.now(),
    metadata,
  });
  return id;
}

export function endSpan(
  spanId: string,
  extra?: Partial<Pick<PerformanceSpan, "requestId" | "serverDurationMs" | "metadata">>,
): PerformanceSpan | null {
  const span = activeSpans.get(spanId);
  if (!span) return null;
  activeSpans.delete(spanId);
  const endedAt = performance.now();
  const completed: PerformanceSpan = {
    ...span,
    ...extra,
    metadata: { ...span.metadata, ...extra?.metadata },
    endedAt,
    durationMs: endedAt - span.startedAt,
  };
  pushCompleted(completed);
  if (process.env.NODE_ENV === "development") {
    console.debug("[PerformanceTelemetry]", completed.name, {
      durationMs: Math.round(completed.durationMs ?? 0),
      serverDurationMs: completed.serverDurationMs,
      requestId: completed.requestId,
      metadata: completed.metadata,
    });
  }
  return completed;
}

export function recordResponseHeaders(res: Response, spanId?: string): void {
  const requestId = res.headers.get("X-Request-ID") ?? undefined;
  const durationHeader = res.headers.get("X-Duration-Ms");
  const serverDurationMs =
    durationHeader !== null && durationHeader !== "" ? Number(durationHeader) : undefined;
  const cacheHitHeader = res.headers.get("X-Cache-Hit");
  const serverCacheHit =
    cacheHitHeader === "true" ? true : cacheHitHeader === "false" ? false : undefined;
  const versionHeader = res.headers.get("X-Projection-Version");
  const projectionVersion =
    versionHeader !== null && versionHeader !== ""
      ? Number(versionHeader)
      : undefined;

  if (!spanId) return;
  const span = activeSpans.get(spanId);
  if (!span) return;
  span.requestId = requestId;
  if (serverDurationMs !== undefined && !Number.isNaN(serverDurationMs)) {
    span.serverDurationMs = serverDurationMs;
  }
  if (serverCacheHit !== undefined) {
    span.serverCacheHit = serverCacheHit;
  }
  if (projectionVersion !== undefined && !Number.isNaN(projectionVersion)) {
    span.projectionVersion = projectionVersion;
  }
}

export function getServerCacheHitRatio(spans: PerformanceSpan[]): {
  hits: number;
  total: number;
  ratio: number | null;
} {
  const withHeader = spans.filter((span) => span.serverCacheHit !== undefined);
  const hits = withHeader.filter((span) => span.serverCacheHit).length;
  return {
    hits,
    total: withHeader.length,
    ratio: withHeader.length > 0 ? hits / withHeader.length : null,
  };
}

export function startLoginToPulseSpan(): void {
  if (loginToPulseSpanId) return;
  loginToPulseSpanId = startSpan("login.to_pulse");
}

export function endLoginToPulseSpan(): PerformanceSpan | null {
  if (!loginToPulseSpanId) return null;
  const spanId = loginToPulseSpanId;
  loginToPulseSpanId = null;
  return endSpan(spanId);
}

/** Mark first paint of usable pulse data (cached or network). */
export function markPulseTimeToVisible(metadata?: Record<string, unknown>): void {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") {
    return;
  }
  try {
    performance.mark("pulse-visible");
    const startExists = performance
      .getEntriesByName("pulse-load-start", "mark")
      .some((e) => e.entryType === "mark");
    if (startExists) {
      performance.measure("pulse-time-to-visible", "pulse-load-start", "pulse-visible");
    } else {
      performance.mark("pulse-load-start");
      performance.measure("pulse-time-to-visible", "pulse-load-start", "pulse-visible");
    }
  } catch {
    /* ignore mark collisions */
  }
  const id = startSpan("pulse.time_to_visible", metadata);
  endSpan(id, { metadata });
}

export function markPulseLoadStart(): void {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") {
    return;
  }
  try {
    performance.mark("pulse-load-start");
  } catch {
    /* ignore */
  }
}

/** Mark shell first paint (cached session path). */
export function markShellPaint(): void {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") {
    return;
  }
  try {
    performance.mark("shell-paint");
  } catch {
    /* ignore */
  }
}

/** Mark selected tab content visible (cached or network). */
export function markSelectedTabVisible(metadata?: Record<string, unknown>): void {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") {
    return;
  }
  try {
    performance.mark("selected-tab-visible");
  } catch {
    /* ignore */
  }
  const id = startSpan("pulse.time_to_visible", {
    ...metadata,
    mark: "selected-tab-visible",
  });
  endSpan(id, { metadata });
}

/** Mark auth /me validation complete. */
export function markAuthValidated(): void {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") {
    return;
  }
  try {
    performance.mark("auth-validated");
  } catch {
    /* ignore */
  }
}

export function startQuickAddSaveSpan(): void {
  if (quickAddSaveSpanId) return;
  quickAddSaveSpanId = startSpan("quick_add.save");
}

export function endQuickAddSaveSpan(): PerformanceSpan | null {
  if (!quickAddSaveSpanId) return null;
  const spanId = quickAddSaveSpanId;
  quickAddSaveSpanId = null;
  return endSpan(spanId);
}

export function getActiveSpans(): PerformanceSpan[] {
  return Array.from(activeSpans.values());
}

export function getRecentSpans(limit = 50): PerformanceSpan[] {
  return completedSpans.slice(0, limit);
}

export function clearPerformanceTelemetry(): void {
  activeSpans.clear();
  completedSpans.length = 0;
  loginToPulseSpanId = null;
  quickAddSaveSpanId = null;
  activeFlows.clear();
  completedFlows.length = 0;
  requestFingerprints.clear();
  duplicateRequestCount = 0;
  staleResponseIgnoredCount = 0;
  abortedRequestCount = 0;
  activeCorrelationId = null;
}

/* —— Loading flow contract (see docs/platform/MOMENTRA_LOADING_PERFORMANCE_CONTRACT.md) —— */

export type FlowEventName =
  | "flow_started"
  | "shell_painted"
  | "cache_read_started"
  | "cache_read_completed"
  | "network_started"
  | "network_completed"
  | "backend_completed"
  | "store_updated"
  | "content_rendered"
  | "screen_interactive"
  | "background_reconcile_started"
  | "background_reconcile_completed"
  | "mutation_started"
  | "optimistic_update_applied"
  | "mutation_committed"
  | "mutation_failed"
  | "rollback_applied"
  | "pulse_refresh_started"
  | "pulse_refreshed"
  | "activity_refresh_started"
  | "activity_refreshed"
  | "projection_refresh_started"
  | "projection_refreshed"
  | "final_consistency_reached";

export type FlowTrace = {
  id: string;
  flow: string;
  correlationId: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  success?: boolean;
  errorCode?: string;
  marks: Array<{ event: string; at: number; metadata?: Record<string, unknown> }>;
  requestIds: string[];
  metadata?: Record<string, unknown>;
};

const activeFlows = new Map<string, FlowTrace>();
const completedFlows: FlowTrace[] = [];
const MAX_FLOWS = 50;
const requestFingerprints = new Map<string, number>();
let duplicateRequestCount = 0;
let staleResponseIgnoredCount = 0;
let abortedRequestCount = 0;
let activeCorrelationId: string | null = null;

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Stable non-reversible hash for identity correlation (privacy). */
export async function hashIdentity(value: string): Promise<string> {
  const salt = "momentra-loading-v1";
  const input = `${salt}:${value}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);
  }
  // Fallback (non-crypto) for test envs without subtle
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0").slice(0, 16);
}

export function getActiveCorrelationId(): string | null {
  return activeCorrelationId;
}

export function setActiveCorrelationId(id: string | null): void {
  activeCorrelationId = id;
}

export function mintRequestId(): string {
  return newId("req");
}

export function mintCorrelationId(): string {
  return newId("corr");
}

export function startFlow(
  flow: string,
  metadata?: Record<string, unknown>,
): string {
  const id = newId("flow");
  const correlationId =
    (typeof metadata?.correlation_id === "string" && metadata.correlation_id) ||
    mintCorrelationId();
  activeCorrelationId = correlationId;
  const trace: FlowTrace = {
    id,
    flow,
    correlationId,
    startedAt: performance.now(),
    marks: [{ event: "flow_started", at: performance.now(), metadata }],
    requestIds: [],
    metadata: { platform: "web", ...metadata },
  };
  activeFlows.set(id, trace);
  if (typeof performance !== "undefined" && performance.mark) {
    try {
      performance.mark(`flow:${flow}:start`);
    } catch {
      /* ignore */
    }
  }
  if (process.env.NODE_ENV === "development") {
    console.debug("[FlowTelemetry] start", flow, { id, correlationId });
  }
  return id;
}

export function mark(
  flowId: string,
  event: FlowEventName | string,
  metadata?: Record<string, unknown>,
): void {
  const trace = activeFlows.get(flowId);
  if (!trace) return;
  const at = performance.now();
  trace.marks.push({ event, at, metadata });
  if (typeof performance !== "undefined" && performance.mark) {
    try {
      performance.mark(`flow:${trace.flow}:${event}`);
    } catch {
      /* ignore */
    }
  }
}

export function measure(
  flowId: string,
  fromEvent: string,
  toEvent: string,
): number | null {
  const trace = activeFlows.get(flowId) ?? completedFlows.find((f) => f.id === flowId);
  if (!trace) return null;
  const from = [...trace.marks].reverse().find((m) => m.event === fromEvent);
  const to = [...trace.marks].reverse().find((m) => m.event === toEvent);
  if (!from || !to) return null;
  return to.at - from.at;
}

export function attachRequest(
  flowId: string,
  requestId: string,
  correlationId?: string,
): void {
  const trace = activeFlows.get(flowId);
  if (!trace) return;
  trace.requestIds.push(requestId);
  if (correlationId) {
    trace.correlationId = correlationId;
    activeCorrelationId = correlationId;
  }
}

export function completeFlow(
  flowId: string,
  metadata?: Record<string, unknown>,
): FlowTrace | null {
  const trace = activeFlows.get(flowId);
  if (!trace) return null;
  activeFlows.delete(flowId);
  const endedAt = performance.now();
  const completed: FlowTrace = {
    ...trace,
    endedAt,
    durationMs: endedAt - trace.startedAt,
    success: true,
    metadata: { ...trace.metadata, ...metadata },
  };
  completedFlows.unshift(completed);
  if (completedFlows.length > MAX_FLOWS) completedFlows.length = MAX_FLOWS;
  if (process.env.NODE_ENV === "development") {
    console.debug("[FlowTelemetry] complete", completed.flow, {
      durationMs: Math.round(completed.durationMs ?? 0),
      marks: completed.marks.map((m) => m.event),
      requestCount: completed.requestIds.length,
    });
  }
  return completed;
}

export function failFlow(
  flowId: string,
  errorCode: string,
  metadata?: Record<string, unknown>,
): FlowTrace | null {
  const trace = activeFlows.get(flowId);
  if (!trace) return null;
  activeFlows.delete(flowId);
  const endedAt = performance.now();
  const completed: FlowTrace = {
    ...trace,
    endedAt,
    durationMs: endedAt - trace.startedAt,
    success: false,
    errorCode,
    metadata: { ...trace.metadata, ...metadata },
  };
  completedFlows.unshift(completed);
  if (completedFlows.length > MAX_FLOWS) completedFlows.length = MAX_FLOWS;
  return completed;
}

export function exportDebugTrace(flowId: string): FlowTrace | null {
  return (
    activeFlows.get(flowId) ??
    completedFlows.find((f) => f.id === flowId) ??
    null
  );
}

export function getRecentFlows(limit = 20): FlowTrace[] {
  return completedFlows.slice(0, limit);
}

export function recordDuplicateRequest(fingerprint: string): void {
  const prev = requestFingerprints.get(fingerprint) ?? 0;
  requestFingerprints.set(fingerprint, prev + 1);
  if (prev > 0) duplicateRequestCount += 1;
}

export function noteStaleResponseIgnored(): void {
  staleResponseIgnoredCount += 1;
}

export function noteAbortedRequest(): void {
  abortedRequestCount += 1;
}

export function getFlowCounters(): {
  duplicateRequests: number;
  staleResponseIgnored: number;
  abortedRequests: number;
} {
  return {
    duplicateRequests: duplicateRequestCount,
    staleResponseIgnored: staleResponseIgnoredCount,
    abortedRequests: abortedRequestCount,
  };
}
