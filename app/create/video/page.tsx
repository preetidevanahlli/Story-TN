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
import { Sparkles, Video, ArrowLeft, Download, Play, Pause, Wand2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function CreateVideoStoryPage() {
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
    visualStyle: "cinematic",
    theme: "inspiring",
    duration: "3-5min",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isPaid) {
      router.push("/checkout?package=video")
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

    // Simulate comprehensive generation with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 500)

    // Simulate API call
    setTimeout(() => {
      setGeneratedStory(`# ${formData.name}'s Life Story & Future Vision

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

## Future Visualization

Imagine a world where these dreams become reality. Picture the impact, the growth, the fulfillment that comes from pursuing these aspirations with unwavering determination. This is not just a story—it's a blueprint for the future.`)

      // Simulate video and audio URLs
      setVideoUrl("/placeholder-video.mp4")
      setAudioUrl("/placeholder-audio.mp3")
      setIsGenerating(false)
      clearInterval(interval)
    }, 10000)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const handleDownloadStory = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedStory], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${formData.name}_future_vision.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadVideo = () => {
    alert("Video download would start here")
  }

  const handleDownloadAudio = () => {
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4">
              <Video className="h-4 w-4 mr-2" />
              Future Vision - $19.00
            </Badge>
            <h1 className="text-3xl font-bold mb-2">Create Your Future Vision</h1>
            <p className="text-muted-foreground">Generate story, audio, and immersive video visualization</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Input Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Vision Details</CardTitle>
                <CardDescription>Customize your complete experience</CardDescription>
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
                  <Label htmlFor="background">Background</Label>
                  <Textarea
                    id="background"
                    name="background"
                    placeholder="Your story so far..."
                    value={formData.background}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Future Goals</Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    placeholder="Your vision for the future..."
                    value={formData.goals}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visualStyle">Visual Style</Label>
                  <Select
                    value={formData.visualStyle}
                    onValueChange={(value) => handleSelectChange("visualStyle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="modern">Modern & Clean</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="futuristic">Futuristic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={formData.theme} onValueChange={(value) => handleSelectChange("theme", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inspiring">Inspiring</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="adventurous">Adventurous</SelectItem>
                      <SelectItem value="peaceful">Peaceful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Video Duration</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleSelectChange("duration", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2min">1-2 minutes</SelectItem>
                      <SelectItem value="3-5min">3-5 minutes</SelectItem>
                      <SelectItem value="5-10min">5-10 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  className="w-full"
                  disabled={isGenerating || !formData.name || !formData.goals}
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Vision...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Complete Vision
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-xs text-center text-muted-foreground">
                      {progress < 20 && "Analyzing your vision..."}
                      {progress >= 20 && progress < 40 && "Crafting narrative..."}
                      {progress >= 40 && progress < 60 && "Generating voice..."}
                      {progress >= 60 && progress < 80 && "Creating visuals..."}
                      {progress >= 80 && "Finalizing video..."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Video Player */}
              <Card>
                <CardHeader>
                  <CardTitle>Future Vision Video</CardTitle>
                  <CardDescription>
                    {videoUrl ? "Your immersive future visualization" : "Video will appear here once generated"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {videoUrl ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Button size="lg" onClick={togglePlayback} className="rounded-full w-20 h-20 mb-4">
                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            {isPlaying ? "Playing your future vision..." : "Click to play your vision video"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleDownloadVideo} className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download Video (HD)
                        </Button>
                        <Button onClick={handleDownloadAudio} variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Audio Only
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Your future vision video will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Story Text */}
              <Card>
                <CardHeader>
                  <CardTitle>Complete Story & Vision</CardTitle>
                  <CardDescription>
                    {generatedStory ? "Your full narrative with future visualization" : "Story will appear here"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedStory ? (
                    <div className="space-y-4">
                      <div className="max-h-80 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{generatedStory}</pre>
                      </div>
                      <Button onClick={handleDownloadStory} variant="outline" className="w-full bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Download Complete Story
                      </Button>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Your complete story and vision will appear here</p>
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
