import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { capturePayPalOrder } from "@/lib/paypal"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session as any)?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { orderId } = (await req.json()) as { orderId: string }
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

  const result = await capturePayPalOrder(orderId)

  // Extract custom_id sent in create-order (format: PRODUCT:PROMPTID)
  const unit = result?.purchase_units?.[0]
  const custom = unit?.custom_id as string | undefined
  const [product, promptId] = (custom ?? ":").split(":") as ["BASIC"|"AUDIO"|"VIDEO"|string, string]
  if (!product || !promptId) return NextResponse.json({ error: "Missing purchase metadata" }, { status: 400 })

  // Record purchase (reuse stripeId field to store PayPal order id)
  await prisma.purchase.create({
    data: {
      userId,
      promptId,
      product: (product as any),
      stripeId: orderId,
    },
  })

  return NextResponse.json({ ok: true })
}


