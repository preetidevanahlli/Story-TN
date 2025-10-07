// filepath: app/api/voice-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createElevenLabsVoice } from "@/lib/elevenlabs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("voice") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call ElevenLabs API to create a custom voice
    const voiceId = await createElevenLabsVoice(buffer, session.user.email);

    // Save voiceId to user profile
    await prisma.user.update({
      where: { email: session.user.email },
      data: { voiceId } as any,
    });

    return NextResponse.json({ success: true, voiceId });
  } catch (err) {
    console.error("Voice upload error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
  }
}
