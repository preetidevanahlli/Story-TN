import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session as any)?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { promptId, product }: { promptId: string; product: "BASIC" | "AUDIO" | "VIDEO" } = await req.json()
  const priceMap: Record<string, string> = {
    BASIC: process.env.STRIPE_PRICE_BASIC as string,
    AUDIO: process.env.STRIPE_PRICE_AUDIO as string,
    VIDEO: process.env.STRIPE_PRICE_VIDEO as string,
  }

  if (!process.env.NEXTAUTH_URL) {
    return NextResponse.json({ error: "Missing NEXTAUTH_URL" }, { status: 500 })
  }
  if (!priceMap[product]) {
    return NextResponse.json({ error: "Invalid or missing Stripe price ID" }, { status: 500 })
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceMap[product], quantity: 1 }],
    metadata: { promptId, product, userId },
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
  })
  return NextResponse.json({ url: checkout.url })
}



