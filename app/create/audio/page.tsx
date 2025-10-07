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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Mic, ArrowLeft, Download, Play, Pause, Wand2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function CreateAudioStoryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isPaid = searchParams.get("paid") === "true"

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    occupation: "",
    background: "",
    goals: "",
    challenges: "",
    values: "",
    voiceStyle: "natural",
    pace: "medium",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isPaid) {
      router.push("/checkout?package=audio")
    }
  }, [isPaid, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)

    // Simulate story and audio generation with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 8
      })
    }, 400)

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

The journey continues with renewed purpose and clarity. Each day brings new opportunities to grow, contribute, and move closer to realizing these dreams. The story is far from over—in fact, the best chapters may still be unwritten.`)

      // Simulate audio URL (in real app, this would be from AI voice generation)
      setAudioUrl("/placeholder-audio.mp3")
      setIsGenerating(false)
      clearInterval(interval)
    }, 5000)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // In a real app, this would control actual audio playback
  }

  const handleDownloadStory = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedStory], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${formData.name}_life_story.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadAudio = () => {
    // In a real app, this would download the actual audio file
    alert("Audio download would start here")
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4">
              <Mic className="h-4 w-4 mr-2" />
              Audio Experience - $9.00
            </Badge>
            <h1 className="text-3xl font-bold mb-2">Create Your Audio Life Story</h1>
            <p className="text-muted-foreground">Generate your story and hear it in your own voice</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Story Details</CardTitle>
                <CardDescription>Tell us about yourself and customize your audio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Input id="age" name="age" placeholder="Your age" value={formData.age} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    placeholder="What do you do?"
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background">Background</Label>
                  <Textarea
                    id="background"
                    name="background"
                    placeholder="Your background and experiences..."
                    value={formData.background}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Future Goals</Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    placeholder="Your aspirations and dreams..."
                    value={formData.goals}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voiceStyle">Voice Style</Label>
                  <Select
                    value={formData.voiceStyle}
                    onValueChange={(value) => handleSelectChange("voiceStyle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="warm">Warm & Friendly</SelectItem>
                      <SelectItem value="confident">Confident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pace">Speaking Pace</Label>
                  <Select value={formData.pace} onValueChange={(value) => handleSelectChange("pace", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow & Deliberate</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="fast">Fast & Energetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  className="w-full"
                  disabled={isGenerating || !formData.name || !formData.background}
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Story & Audio
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                      {progress < 25 && "Analyzing your information..."}
                      {progress >= 25 && progress < 50 && "Crafting your narrative..."}
                      {progress >= 50 && progress < 75 && "Generating voice clone..."}
                      {progress >= 75 && "Creating audio narration..."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Audio Player */}
              <Card>
                <CardHeader>
                  <CardTitle>Audio Narration</CardTitle>
                  <CardDescription>
                    {audioUrl ? "Your story narrated in your voice" : "Audio will appear here once generated"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {audioUrl ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <Button size="lg" onClick={togglePlayback} className="rounded-full w-16 h-16">
                              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {isPlaying ? "Playing your story..." : "Click to play your audio story"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleDownloadAudio} className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download Audio
                        </Button>
                        <Button variant="outline" onClick={() => setAudioUrl("")}>
                          Generate New
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Your audio narration will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Story Text */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Story Text</CardTitle>
                  <CardDescription>
                    {generatedStory ? "Your personalized narrative" : "Story text will appear here"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedStory ? (
                    <div className="space-y-4">
                      <div className="max-h-64 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{generatedStory}</pre>
                      </div>
                      <Button onClick={handleDownloadStory} variant="outline" className="w-full bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Download Story Text
                      </Button>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Your story text will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
