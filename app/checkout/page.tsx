"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sparkles, CreditCard, Lock, ArrowLeft, FileText, Mic, Video } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

const packages = {
  text: {
    name: "Story Prompt",
    price: 1,
    icon: FileText,
    features: ["AI-generated life story", "Future goals planning", "Text format download", "Basic customization"],
  },
  audio: {
    name: "Audio Experience",
    price: 9,
    icon: Mic,
    features: ["Everything in Story Prompt", "AI voice narration", "Your voice clone", "High-quality audio file"],
  },
  video: {
    name: "Future Vision",
    price: 19,
    icon: Video,
    features: ["Everything in Audio", "Future visualization video", "HD video quality", "Custom animations"],
  },
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const packageType = (searchParams.get("package") as keyof typeof packages) || "text"
  const selectedPackage = packages[packageType]

  const [paymentData, setPaymentData] = useState({
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    country: "US",
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      // Redirect to success page or story creation
      router.push(`/create/${packageType}?paid=true`)
    }, 3000)
  }

  const IconComponent = selectedPackage.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              StoryGen
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">Secure checkout powered by Stripe</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="order-2 lg:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-green-500" />
                    Secure Payment
                  </CardTitle>
                  <CardDescription>Your payment information is encrypted and secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={paymentData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={paymentData.expiryDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Cardholder Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={paymentData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Lock className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        Your payment is secured with 256-bit SSL encryption
                      </span>
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg" disabled={isProcessing}>
                      {isProcessing ? "Processing Payment..." : `Pay $${selectedPackage.price}.00`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="order-1 lg:order-2">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedPackage.name}</h3>
                      <p className="text-sm text-muted-foreground">AI-powered story generation</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${selectedPackage.price}.00</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">What's included:</h4>
                    {selectedPackage.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${selectedPackage.price}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>$0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${selectedPackage.price}.00</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
