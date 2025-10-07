"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sparkles,
  Plus,
  FileText,
  Mic,
  Video,
  Download,
  Play,
  Settings,
  LogOut,
  Crown,
  Clock,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

type DashboardPrompt = {
  id: string
  text: string | null
  createdAt: string
  purchases: { product: "BASIC" | "AUDIO" | "VIDEO" }[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("stories")
  const [prompts, setPrompts] = useState<DashboardPrompt[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const userName = session?.user?.name || session?.user?.email || "User"
  const userEmail = session?.user?.email || ""
  const initials = useMemo(() => {
    const basis = (userName || "U").trim()
    const parts = basis.split(" ")
    const first = parts[0]?.[0] || "U"
    const second = parts[1]?.[0] || ""
    return (first + second).toUpperCase()
  }, [userName])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/prompts", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setPrompts(data.prompts || [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const generateAudio = async (promptId: string) => {
    try {
      setGeneratingId(promptId)
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      })
      if (!res.ok) {
        alert("Audio not available. Please purchase the Audio or Video option.")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      // Play
      const audio = new Audio(url)
      audio.play()
      // Also offer download
      const a = document.createElement("a")
      a.href = url
      a.download = `story-${promptId}.mp3`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } finally {
      setGeneratingId(null)
    }
  }

  const startCheckout = async (promptId: string, product: "BASIC" | "AUDIO" | "VIDEO") => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, product }),
      })
      if (!res.ok) throw new Error("Checkout failed")
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (e: any) {
      alert(e?.message || "Checkout failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              StoryGen
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("create")}>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{userName}</h3>
                    <p className="text-sm text-muted-foreground">{userEmail || "Free Plan"}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeTab === "stories" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("stories")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  My Stories
                </Button>
                <Button
                  variant={activeTab === "create" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("create")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <div className="pt-4 border-t">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "stories" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Stories</p>
                          <p className="text-2xl font-bold">{prompts.length}</p>
                        </div>
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">This Month</p>
                          <p className="text-2xl font-bold">{
                            prompts.filter(p => {
                              const d = new Date(p.createdAt)
                              const now = new Date()
                              return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
                            }).length
                          }</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Processing</p>
                          <p className="text-2xl font-bold">{
                            prompts.filter(p => !p.text || p.text.trim() === "").length
                          }</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stories List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Your Stories</h2>
                    <Button onClick={() => setActiveTab("create")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Story
                    </Button>
                  </div>

                  {loading && <div className="text-muted-foreground">Loading...</div>}
                  {!loading && prompts.length === 0 && (
                    <div className="text-muted-foreground">No stories yet. Create one to get started.</div>
                  )}
                  {!loading && prompts.map((p) => (
                    <Card key={p.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">Story</h3>
                              <Badge variant="secondary">
                                {p.purchases.some(x => x.product === "VIDEO")
                                  ? "video"
                                  : p.purchases.some(x => x.product === "AUDIO")
                                  ? "audio"
                                  : "text"}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-3 line-clamp-3">{p.text || "No text yet."}</p>
                            <p className="text-sm text-muted-foreground">Created on {new Date(p.createdAt).toLocaleString()}</p>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Link href={`/prompt/${p.id}`}>
                              <Button size="sm" variant="outline">
                                <Play className="h-4 w-4 mr-2" />
                                Open
                              </Button>
                            </Link>
                            {p.purchases.some(x => x.product === "AUDIO" || x.product === "VIDEO") ? (
                              <Button size="sm" onClick={() => generateAudio(p.id)} disabled={generatingId === p.id}>
                                {generatingId === p.id ? "Generating..." : "Generate Audio"}
                              </Button>
                            ) : (
                              <Button size="sm" variant="secondary" onClick={() => startCheckout(p.id, "AUDIO")}>Buy Audio ($9)</Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => startCheckout(p.id, "VIDEO")}>Buy Video ($19)</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "create" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Create Your Story</h2>
                  <p className="text-muted-foreground">Choose the type of story experience you want to create</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Text Story */}
                  <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader className="text-center pb-4">
                      <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                      <CardTitle>Story Prompt</CardTitle>
                      <div className="text-3xl font-bold text-primary">$1</div>
                      <CardDescription>AI-generated life story in text format</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Personalized narrative</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Future goals planning</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Downloadable text</span>
                      </div>
                      <Link href="/create/text">
                        <Button className="w-full mt-4">Create Text Story</Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Audio Story */}
                  <Card className="border-2 border-primary hover:border-primary transition-colors cursor-pointer scale-105">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                    </div>
                    <CardHeader className="text-center pb-4">
                      <Mic className="h-12 w-12 text-primary mx-auto mb-4" />
                      <CardTitle>Audio Experience</CardTitle>
                      <div className="text-3xl font-bold text-primary">$9</div>
                      <CardDescription>Story + AI voice narration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Everything in text story</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>AI voice narration</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Your voice clone</span>
                      </div>
                      <Link href="/create/audio">
                        <Button className="w-full mt-4">Create Audio Story</Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Video Story */}
                  <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader className="text-center pb-4">
                      <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                      <CardTitle>Future Vision</CardTitle>
                      <div className="text-3xl font-bold text-primary">$19</div>
                      <CardDescription>Complete immersive experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Everything in audio</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Future visualization</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>HD video quality</span>
                      </div>
                      <Link href="/create/video">
                        <Button className="w-full mt-4">Create Video Story</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
                  <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">First Name</label>
                        <input type="text" placeholder="First name" className="w-full mt-1 px-3 py-2 border rounded-md" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name</label>
                        <input type="text" placeholder="Last name" className="w-full mt-1 px-3 py-2 border rounded-md" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input type="email" defaultValue={userEmail} className="w-full mt-1 px-3 py-2 border rounded-md" />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Manage your plan and billing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Free Plan</h4>
                        <p className="text-sm text-muted-foreground">Basic story generation</p>
                      </div>
                      <Button>
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
