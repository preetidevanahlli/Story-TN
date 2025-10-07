import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id
  if (!sessionId) redirect("/dashboard")

  // Retrieve session server-side to access metadata
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const product = (session.metadata?.product as "BASIC" | "AUDIO" | "VIDEO" | undefined) ?? "BASIC"

  // Decide destination based on product purchased
  const dest = product === "AUDIO" ? "/create/audio?paid=true" : product === "VIDEO" ? "/create/video?paid=true" : "/create/text?paid=true"

  // Simple success screen with meta refresh as fallback
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content={`2;url=${dest}`} />
        <title>Payment Successful</title>
      </head>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h1>Payment successful</h1>
            <p>Redirecting you to your creation page...</p>
            <p>
              If you are not redirected automatically, <a href={dest}>click here</a>.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}


