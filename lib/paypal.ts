const PAYPAL_BASE = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"

async function getAccessToken(): Promise<string> {
  const client = process.env.PAYPAL_CLIENT_ID as string
  const secret = process.env.PAYPAL_CLIENT_SECRET as string
  const auth = Buffer.from(`${client}:${secret}`).toString("base64")
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  })
  if (!res.ok) throw new Error("PayPal auth failed")
  const data = await res.json()
  return data.access_token
}

export async function createPayPalOrder(params: {
  amount: string
  currency?: string
  returnUrl: string
  cancelUrl: string
  promptId: string
  product: "BASIC" | "AUDIO" | "VIDEO"
}) {
  const token = await getAccessToken()
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: params.currency ?? "USD", value: params.amount },
          custom_id: `${params.product}:${params.promptId}`,
        },
      ],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  })
  if (!res.ok) throw new Error("PayPal create order failed")
  return res.json()
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken()
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("PayPal capture failed")
  return res.json()
}


