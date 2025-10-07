import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getServerSession } from "next-auth"

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { promptId, product }: { promptId: string; product: "BASIC" | "AUDIO" | "VIDEO" } = await req.json()
  const priceMap: Record<string, string> = {
    BASIC: process.env.STRIPE_PRICE_BASIC as string,
    AUDIO: process.env.STRIPE_PRICE_AUDIO as string,
    VIDEO: process.env.STRIPE_PRICE_VIDEO as string,
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceMap[product], quantity: 1 }],
    metadata: { promptId, product, userId: (session as any).user.id },
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
  })
  return NextResponse.json({ url: checkout.url })
}



