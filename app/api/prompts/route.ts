import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session as any)?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { about, struggles, goals, goodThings, text } = await req.json()
  const prompt = await prisma.prompt.create({
    data: {
      userId,
      about,
      struggles,
      goals,
      goodThings,
      text,
    },
  })
  return NextResponse.json({ prompt })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session as any)?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const prompts = await prisma.prompt.findMany({
    where: { userId },
    include: { purchases: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ prompts })
}



