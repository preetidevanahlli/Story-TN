import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })

    const hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, password: hash, firstName, lastName },
      select: { id: true, email: true },
    })

    return NextResponse.json({ user })
  } catch (err: any) {
    const message = err?.message || "Signup failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



