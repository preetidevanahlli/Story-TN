import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { elevenlabs } from "@/lib/elevenlabs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, age, occupation, background, goals, challenges, values } = await req.json();

    // Fetch user
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check user purchase
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        product: { in: ["AUDIO", "VIDEO"] },
      },
    });
    if (!purchase) {
      return NextResponse.json({ error: "Purchase required" }, { status: 402 });
    }

    // Generate story text using template
    const storyText = generateStoryText({ name, age, occupation, background, goals, challenges, values });

    // Save as prompt
    const prompt = await prisma.prompt.create({
      data: {
        userId: user.id,
        text: storyText,
        about: background,
        struggles: challenges,
        goals,
        goodThings: values,
      },
    });

    // Fetch user's voiceId
    const voiceId = (user as any).voiceId || "Rachel";

    // Generate audio
    const response = await elevenlabs.textToSpeech.convert({
      voice_id: voiceId,
      model_id: "eleven_turbo_v2",
      text: storyText,
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
        "Content-Disposition": `inline; filename=${name}_story.mp3`,
        "X-Story-Text": encodeURIComponent(storyText),
        "X-Prompt-Id": prompt.id,
      },
    });

  } catch (err) {
    console.error("Story generation error:", err);
    return NextResponse.json({ error: "Generation failed", details: err instanceof Error ? err.message : err }, { status: 500 });
  }
}

function generateStoryText(data: any): string {
  return `# ${data.name}'s Life Story

## The Journey So Far

At ${data.age} years old, ${data.name} has carved out a unique path as a ${data.occupation}. ${data.background} This foundation has shaped not just their career, but their entire worldview.

## Core Values & Beliefs

What drives ${data.name} forward are their deeply held values: ${data.values}. These principles serve as a compass, guiding decisions both big and small.

## Overcoming Challenges

Life hasn't always been smooth sailing. ${data.challenges} But these obstacles have only strengthened their resolve and taught valuable lessons about resilience and adaptability.

## Vision for the Future

Looking ahead, ${data.name} has set ambitious goals: ${data.goals}. This vision isn't just about personal achievement—it's about making a meaningful impact and leaving a lasting legacy.

## The Path Forward

The journey continues with renewed purpose and clarity. Each day brings new opportunities to grow, contribute, and move closer to realizing these dreams. The story is far from over—in fact, the best chapters may still be unwritten.`;
}
