import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const sig = (req.headers.get("stripe-signature") || "") as string
  const rawBody = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any
    const { promptId, product, userId } = session.metadata || {}
    if (promptId && product && userId) {
      await prisma.purchase.create({
        data: {
          userId,
          promptId,
          product,
          stripeId: session.id,
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}

export const config = { api: { bodyParser: false } } as any



