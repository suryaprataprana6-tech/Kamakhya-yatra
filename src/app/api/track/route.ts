import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, pagePath, userAgent, referrer, type } = await req.json();

    if (!sessionId || !pagePath) {
      return NextResponse.json({ error: "Missing sessionId or pagePath" }, { status: 400 });
    }

    if (type === "visit") {
      // 1. Log in page_visits
      const { error: visitError } = await supabaseServer
        .from("page_visits")
        .insert({
          session_id: sessionId,
          page_path: pagePath,
          user_agent: userAgent || null,
          referrer: referrer || null,
        });

      if (visitError) {
        console.error("Error logging visit:", visitError);
      }
    }

    // 2. Upsert in live_sessions
    const { error: liveError } = await supabaseServer
      .from("live_sessions")
      .upsert(
        {
          session_id: sessionId,
          current_page: pagePath,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "session_id" }
      );

    if (liveError) {
      console.error("Error updating live session:", liveError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Tracking API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export const revalidate = 0; // Don't cache this API route
