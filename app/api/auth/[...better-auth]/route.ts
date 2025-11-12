import { NextResponse } from "next/server";

// Better Auth is disabled - redirect to custom auth routes
export async function GET() {
  return NextResponse.json({ error: "Better Auth is disabled. Use custom auth routes." }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: "Better Auth is disabled. Use custom auth routes." }, { status: 404 });
}