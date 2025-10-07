import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { createPayPalOrder } from "@/lib/paypal"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session as any)?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { promptId, product } = (await req.json()) as { promptId: string; product: "BASIC" | "AUDIO" | "VIDEO" }
  if (!promptId || !product) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const amount = product === "AUDIO" ? "9.00" : product === "VIDEO" ? "19.00" : "1.00"
  const order = await createPayPalOrder({
    amount,
    promptId,
    product,
    returnUrl: `${process.env.NEXTAUTH_URL}/checkout/success`,
    cancelUrl: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
  })
  return NextResponse.json(order)
}


