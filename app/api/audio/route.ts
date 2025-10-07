import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { elevenlabs } from "@/lib/elevenlabs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch user from DB
  if (!session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return NextResponse.json({ voiceId: (user as any)?.voiceId || null });
}

export async function POST(req: Request) {
  try {
    // 1️⃣ Get user session
    interface SessionUser {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      voiceId?: string | null;
    }
    const session = await getServerSession(authOptions) as { user: SessionUser } | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Parse request
    const { promptId } = await req.json();
    if (!promptId) {
      return NextResponse.json({ error: "Missing promptId" }, { status: 400 });
    }

    // 3️⃣ Check user purchase
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        promptId,
        product: { in: ["AUDIO", "VIDEO"] },
      },
    });
    if (!purchase) {
      return NextResponse.json({ error: "Purchase required" }, { status: 402 });
    }

    // 4️⃣ Fetch prompt text
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt?.text) {
      return NextResponse.json({ error: "No text available" }, { status: 400 });
    }

  // 5️⃣ Fetch user's voiceId from DB (always fresh)
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const voiceId = (user as any)?.voiceId || "Rachel";

  // 6️⃣ Generate audio using ElevenLabs TTS
  const response = await elevenlabs.textToSpeech.convert({
    voice_id: voiceId,
    model_id: "eleven_turbo_v2",
    text: prompt.text,
    voice_settings: {
      stability: 0.7,
      similarity_boost: 0.75
    }
  });


    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename=prompt-${promptId}.mp3`,
      },
    });

  } catch (err) {
    console.error("ElevenLabs TTS error:", err);
    return NextResponse.json({ error: "Audio generation failed", details: err instanceof Error ? err.message : err }, { status: 500 });
  }
}