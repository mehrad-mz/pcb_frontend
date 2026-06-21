import { NextResponse } from "next/server";

type GpuLogEntry = {
  sessionId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
  hypothesisId: string;
  runId?: string;
  timestamp: number;
};

const SESSION_ID = "d83320";
const MAX_LOGS = 200;
const logBuffer: GpuLogEntry[] = [];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GpuLogEntry;
    if (body.sessionId !== SESSION_ID) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    logBuffer.push(body);
    if (logBuffer.length > MAX_LOGS) {
      logBuffer.splice(0, logBuffer.length - MAX_LOGS);
    }

    // Server stdout — visible via `docker logs` or hosting console
    console.log(`[GPU_DEBUG_${SESSION_ID}] ${JSON.stringify(body)}`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("sessionId") !== SESSION_ID) {
    return NextResponse.json({ error: "Invalid sessionId" }, { status: 403 });
  }

  return NextResponse.json({
    sessionId: SESSION_ID,
    count: logBuffer.length,
    logs: logBuffer,
  });
}
