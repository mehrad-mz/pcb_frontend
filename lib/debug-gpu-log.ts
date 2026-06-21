type DebugGpuPayload = {
  location: string;
  message: string;
  data: Record<string, unknown>;
  hypothesisId: string;
  runId?: string;
};

export function debugGpuLog({
  location,
  message,
  data,
  hypothesisId,
  runId = "baseline",
}: DebugGpuPayload) {
  const payload = {
    sessionId: "d83320",
    location,
    message,
    data,
    hypothesisId,
    runId,
    timestamp: Date.now(),
  };

  // Always visible in browser DevTools (Edge on Windows)
  console.warn("__DEBUG_D83320__", JSON.stringify(payload));

  // #region agent log
  // Same-origin: works when app runs on remote server
  fetch("/api/debug/gpu-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});

  // Local Cursor debug ingest (only when developing on localhost)
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    fetch("http://127.0.0.1:7644/ingest/fe7d9e00-3979-4e07-93b2-cb24793f62fd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "d83320",
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
  // #endregion
}

/** URL to fetch collected logs after reproducing on the server */
export const GPU_DEBUG_LOGS_URL = "/api/debug/gpu-log?sessionId=d83320";
