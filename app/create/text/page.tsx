"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, FileText, ArrowLeft, Download, Wand2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CreateTextStoryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isPaid = searchParams.get("paid") === "true"
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    occupation: "",
    background: "",
    goals: "",
    challenges: "",
    values: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState("")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isPaid) {
      // Redirect to checkout if not paid
      router.push("/checkout?package=text")
    }
  }, [isPaid, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)

    // Simulate story generation with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // Simulate API call
    setTimeout(() => {
      setGeneratedStory(`# ${formData.name}'s Life Story

## The Journey So Far

At ${formData.age} years old, ${formData.name} has carved out a unique path as a ${formData.occupation}. ${formData.background} This foundation has shaped not just their career, but their entire worldview.

## Core Values & Beliefs

What drives ${formData.name} forward are their deeply held values: ${formData.values}. These principles serve as a compass, guiding decisions both big and small.

## Overcoming Challenges

Life hasn't always been smooth sailing. ${formData.challenges} But these obstacles have only strengthened their resolve and taught valuable lessons about resilience and adaptability.

## Vision for the Future

Looking ahead, ${formData.name} has set ambitious goals: ${formData.goals}. This vision isn't just about personal achievement—it's about making a meaningful impact and leaving a lasting legacy.

## The Path Forward

The journey continues with renewed purpose and clarity. Each day brings new opportunities to grow, contribute, and move closer to realizing these dreams. The story is far from over—in fact, the best chapters may still be unwritten.

*This personalized story was generated based on your unique experiences and aspirations. Your journey is one-of-a-kind, and this narrative captures just a glimpse of your remarkable path.*`)

      setIsGenerating(false)
      clearInterval(interval)
    }, 3500)
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedStory], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${formData.name}_life_story.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSave = async () => {
    if (!generatedStory) return
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          about: formData.background,
          struggles: formData.challenges,
          goals: formData.goals,
          goodThings: formData.values,
          text: generatedStory,
        }),
      })
      if (!res.ok) throw new Error("Failed to save story")
      toast({ title: "Saved!", description: "Your story was saved to My Stories." })
      router.push("/dashboard")
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Please try again.", variant: "destructive" })
    }
  }

  if (!isPaid) {
    return <div>Redirecting to checkout...</div>
  }

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
            <Badge className="mb-4">
              <FileText className="h-4 w-4 mr-2" />
              Story Prompt - $1.00
            </Badge>
            <h1 className="text-3xl font-bold mb-2">Create Your Life Story</h1>
            <p className="text-muted-foreground">Share your experiences and let AI craft your unique narrative</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Tell Us About Yourself</CardTitle>
                <CardDescription>
                  The more details you provide, the more personalized your story will be
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      placeholder="Your age"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    placeholder="What do you do for work?"
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background">Background & Experiences</Label>
                  <Textarea
                    id="background"
                    name="background"
                    placeholder="Tell us about your background, key experiences, and what has shaped you..."
                    value={formData.background}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Future Goals & Dreams</Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    placeholder="What are your aspirations, dreams, and goals for the future?"
                    value={formData.goals}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challenges">Challenges & Obstacles</Label>
                  <Textarea
                    id="challenges"
                    name="challenges"
                    placeholder="What challenges have you overcome or are currently facing?"
                    value={formData.challenges}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="values">Core Values</Label>
                  <Input
                    id="values"
                    name="values"
                    placeholder="What values are most important to you?"
                    value={formData.values}
                    onChange={handleInputChange}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  className="w-full"
                  disabled={isGenerating || !formData.name || !formData.background}
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Your Story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate My Story
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                      {progress < 30 && "Analyzing your information..."}
                      {progress >= 30 && progress < 60 && "Crafting your narrative..."}
                      {progress >= 60 && progress < 90 && "Adding personal touches..."}
                      {progress >= 90 && "Finalizing your story..."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Story */}
            <Card>
              <CardHeader>
                <CardTitle>Your Generated Story</CardTitle>
                <CardDescription>
                  {generatedStory
                    ? "Your personalized life story is ready!"
                    : "Your story will appear here once generated"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedStory ? (
                  <div className="space-y-4">
                    <div className="max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{generatedStory}</pre>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleDownload} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Story
                      </Button>
                      <Button variant="outline" onClick={() => setGeneratedStory("")}>
                        Generate New
                      </Button>
                    </div>
                    <div className="mt-3">
                      <Button variant="outline" onClick={handleSave} className="w-full">
                        Save to My Stories
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Fill out the form and click "Generate My Story" to see your personalized narrative</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
