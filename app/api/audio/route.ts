import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { openai } from "@/lib/openai"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { promptId } = await req.json()
  if (!promptId) return NextResponse.json({ error: "Missing promptId" }, { status: 400 })

  // Ensure user owns AUDIO or VIDEO for this prompt
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: (session as any).user.id,
      promptId,
      product: { in: ["AUDIO", "VIDEO"] },
    },
  })
  if (!purchase) return NextResponse.json({ error: "Purchase required" }, { status: 402 })

  const prompt = await prisma.prompt.findUnique({ where: { id: promptId } })
  if (!prompt?.text) return NextResponse.json({ error: "No text available" }, { status: 400 })

  // Generate audio using OpenAI TTS
  const tts = await (openai as any).audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: prompt.text,
    format: "mp3",
  } as any)

  const arrayBuffer = await tts.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Optionally save to storage and store URL in DB
  // For now, return as binary
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `inline; filename=prompt-${promptId}.mp3` ,
    },
  })
}


