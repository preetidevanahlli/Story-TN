"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Sparkles, RotateCcw, Mic, MicOff, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface FormData {
  lifeJourney: string
  currentDate: string
  currentStruggles: string
  goodThingsPast: string
  deepestDesires: string
  futureDate: string
  futureDescription: string
  areaOfLife: string
}

const lifeAreas = [
  "Health and Vitality: Cultivating strength, energy, and physical well-being by treating my body as the foundation for everything else in life, focusing on movement, nutrition, rest, and preventive care so I thrive with vitality.",
  "Intellectual Growth: Expanding my mind through curiosity, learning, and wisdom by challenging assumptions, sharpening decision-making, and embracing self-education so I evolve from consuming information to creating valuable insights.",
  "Emotional Mastery: Understanding, regulating, and transforming my emotions by developing resilience, empathy, and awareness so I can channel fear into clarity, anger into healthy boundaries, and sadness into reflection.",
  "Character and Integrity: Living in alignment with my deepest values by embodying honesty, courage, and responsibility so I build unshakable trust in myself and with others through consistent actions.",
  "Spiritual Connection: Deepening my sense of meaning and belonging by connecting with higher principles, nature, or a greater power so I stay grounded, centered, and aligned with purpose.",
  "Romantic Love and Intimacy: Building trust, passion, and vulnerability in my relationships so I show up fully as a loving, magnetic, and empowered partner who fosters deep connection.",
  "Parenting and Legacy: Guiding and nurturing the next generation with wisdom, presence, and love so my children are shaped by strong values, resilience, and a lasting sense of purpose.",
  "Social Belonging and Community: Creating meaningful friendships and networks by contributing, connecting, and leading so I am seen as a valued ally, trusted connector, and uplifting presence in my circles.",
  "Financial Identity: Redefining my relationship with money by shifting from scarcity to confidence so I embody abundance, stewardship, and the ability to use wealth as a tool for freedom and purpose.",
  "Career and Calling: Aligning my professional path with my true identity by transforming my work from just a paycheck into a calling where I create growth, fulfillment, and meaningful impact.",
  "Lifestyle and Environment: Designing my daily routines, habits, and surroundings with intention so my environment reflects peace, productivity, and the quality of life I truly want to live.",
  "Life Vision and Purpose: Clarifying my long-term mission and aligning my daily actions with it so I live with clarity, direction, and a legacy that extends beyond myself.",
  "Forgiveness and Release: Letting go of grudges, guilt, and resentment from my past so I free myself from emotional weight and move forward with peace and clarity.",
  "Freedom from Addictions and Vices: Breaking free from destructive patterns and dependencies so I reclaim my power, strengthen my discipline, and live with sovereignty and self-respect.",
]

function PasswordProtection({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "aimerge2025") {
      onAuthenticated()
      toast({
        title: "Access granted!",
        description: "Welcome to the AI Merge Self-Identity Preview.",
      })
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">AI Merge Access</CardTitle>
          </div>
          <CardDescription>Enter the password to access the Self-Identity Preview</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                placeholder="Enter password"
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button type="submit" className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Access Preview
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AIPromptGenerator() {
  const { toast } = useToast()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    lifeJourney: "",
    currentDate: new Date().toLocaleDateString(),
    currentStruggles: "",
    goodThingsPast: "",
    deepestDesires: "",
    futureDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    futureDescription: "",
    areaOfLife: "",
  })

  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isListening, setIsListening] = useState<string | null>(null)
  const recognitionRef = useRef<any | null>(null)

  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const startVoiceRecognition = (field: keyof FormData) => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Voice recognition not supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      })
      return
    }

    const SpeechRecognitionCtor: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition: any = new SpeechRecognitionCtor()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    const currentText = formData[field]
    let finalTranscript = ""

    recognition.onstart = () => {
      setIsListening(field)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      if (field === "currentDate" || field === "futureDate") {
        // For date fields, keep existing value
        return
      }

      const combinedText = currentText + finalTranscript + interimTranscript
      handleInputChange(field, combinedText)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(null)
      toast({
        title: "Voice recognition error",
        description: "There was an error with voice recognition. Please try again.",
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(null)
      if (finalTranscript && field !== "currentDate" && field !== "futureDate") {
        const updatedText = currentText + finalTranscript
        handleInputChange(field, updatedText.trim())
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(null)
  }

  const generatePrompt = () => {
    const template = `${formData.lifeJourney}


The current date is: ${formData.currentDate}

I remember: ${formData.currentStruggles}

But the good things which happened: ${formData.goodThingsPast}

But now I wanted more:  ${formData.deepestDesires} 

Now here I am on: ${formData.futureDate}. ${formData.futureDescription}

Inspite of all the challenges I have accomplished so much in the area of: ${formData.areaOfLife}

I am building my dream life. I am so happy and content.

Write a detailed story about how you were able to achieve this goal. Use Hero's journey framework to write the story. 

# Instructions for writing the story

### **Writing Style:**
- Write in short, clear sentences.
- Absolutely NO EMOJIS
- Absolutely no formatting like bold, italics etc. Just plain text
- Keep sentence length between **10-20 words**.
- Use **common, everyday words** that an 8th grader can easily understand.
- **Prefer simple words** over complex ones.
- Only use technical terms when absolutely needed.
- **Avoid words** with more than **four syllables** whenever possible.
- If you must use a long word, keep the surrounding text simple.
- **Do not use** these words:  
  *indeed, furthermore, thus, moreover, notwithstanding, ostensibly, consequently, specifically, notably, alternatively.*
- **Never** use business clichés or jargon, such as:  
  *delve, digital age, cutting-edge, leverage, proactive, pivotal, seamless, fast-paced, game-changer, quest, realm, landscape, evolve, resilient, thrill, unravel, embark, world.*

You are narrating this story to yourself. So it is like a dialogue between you and your soul. But write the story in first person. Use first-person pronouns to write this dialogue with myself.
Keep the tone conversational. I want the reader to feel as if they are in a conversation not reading something. Add plenty of filler words to make it sound even more conversational.
You do not need to use bullet points or markers for various phases of the Hero's journey. Be more descriptive in your narrative. The dialogue needs to pierce your soul. Creating a nostalgic but detailed narrative of how your life has unfolded. Use an emotionally captivating tone. Describe the emotions and feelings in excruciating detail. Ensure you highlight your core values, priorities, thought process, decision-making approach, and life goals. Use a very conversational tone as if you are narrating the story to a dear friend. Feel free to add plenty of filler words to make it sound more conversational. Describe in excruciating detail the emotions and feelings you are experiencing after achieving this goal. Write out details like the places, people, and city names to describe the entire experience. Describe the positive outcomes you are experiencing due to this endeavor. Write the entire story in the first person. Use a very conversational tone as if you are speaking directly to the listener. Write the whole story in 1st person.  When you write the story, use this date as your current date and write the story as if you are in the current date as stated above.`

    setGeneratedPrompt(template)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      toast({
        title: "Copied to clipboard!",
        description: "Your AI prompt is ready to use.",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying manually.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      lifeJourney: "",
      currentDate: new Date().toLocaleDateString(),
      currentStruggles: "",
      goodThingsPast: "",
      deepestDesires: "",
      futureDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      futureDescription: "",
      areaOfLife: "",
    })
    setGeneratedPrompt("")
  }

  const savePrompt = async () => {
    if (!generatedPrompt) return
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          about: formData.lifeJourney,
          struggles: formData.currentStruggles,
          goals: formData.deepestDesires,
          goodThings: formData.goodThingsPast,
          text: generatedPrompt,
        }),
      })
      if (!res.ok) throw new Error("Failed to save prompt")
      toast({ title: "Saved!", description: "Your story was saved to My Stories." })
      router.push("/dashboard")
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Please try again.", variant: "destructive" })
    }
  }

  const isFormValid = Object.values(formData).every((value) => value.trim() !== "")

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <Image src="/images/ai-merge-logo.png" alt="AI Merge" width={300} height={80} className="h-16 w-auto" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-balance">Self-Identity Preview</h1>
          </div>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Connect with your future self that already exists in the space-time continuum. This AI Merge preview helps
            you introduce yourself to your future identity with utmost clarity and depth.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-xl mx-auto">
            <p className="text-sm text-primary font-medium">Part of the AI Merge Framework • Self-Identity Pillar</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Your Future Self Journey</CardTitle>
              <CardDescription>Share your story to connect with the version of you that already exists</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Select value={formData.areaOfLife} onValueChange={(value) => handleInputChange("areaOfLife", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an area of life to focus on..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {lifeAreas.map((area, index) => (
                      <SelectItem key={index} value={area} className="text-sm">
                        {area.split(":")[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lifeJourney">Your Current Identity Story</Label>
                <div className="relative">
                  <Textarea
                    id="lifeJourney"
                    placeholder="Describe who you are today and your journey so far..."
                    value={formData.lifeJourney}
                    onChange={(e) => handleInputChange("lifeJourney", e.target.value)}
                    className="min-h-32 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() =>
                      isListening === "lifeJourney" ? stopVoiceRecognition() : startVoiceRecognition("lifeJourney")
                    }
                  >
                    {isListening === "lifeJourney" ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentDate">Current Date</Label>
                  <Input
                    id="currentDate"
                    type="date"
                    value={formData.currentDate}
                    onChange={(e) => handleInputChange("currentDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentStruggles">Current Struggles</Label>
                <div className="relative">
                  <Textarea
                    id="currentStruggles"
                    placeholder="What challenges are you facing right now?"
                    value={formData.currentStruggles}
                    onChange={(e) => handleInputChange("currentStruggles", e.target.value)}
                    className="min-h-24 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() =>
                      isListening === "currentStruggles"
                        ? stopVoiceRecognition()
                        : startVoiceRecognition("currentStruggles")
                    }
                  >
                    {isListening === "currentStruggles" ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goodThingsPast">Good Things that have happened recently</Label>
                <div className="relative">
                  <Textarea
                    id="goodThingsPast"
                    placeholder="What positive experiences have happened in your life or profession?"
                    value={formData.goodThingsPast}
                    onChange={(e) => handleInputChange("goodThingsPast", e.target.value)}
                    className="min-h-24 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() =>
                      isListening === "goodThingsPast"
                        ? stopVoiceRecognition()
                        : startVoiceRecognition("goodThingsPast")
                    }
                  >
                    {isListening === "goodThingsPast" ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deepestDesires">Deepest Desires</Label>
                <div className="relative">
                  <Textarea
                    id="deepestDesires"
                    placeholder="What do you want more of in your life?"
                    value={formData.deepestDesires}
                    onChange={(e) => handleInputChange("deepestDesires", e.target.value)}
                    className="min-h-24 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() =>
                      isListening === "deepestDesires"
                        ? stopVoiceRecognition()
                        : startVoiceRecognition("deepestDesires")
                    }
                  >
                    {isListening === "deepestDesires" ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="futureDate">Future Date (e.g. 1 Year from today)</Label>
                <Input
                  id="futureDate"
                  type="date"
                  value={formData.futureDate}
                  onChange={(e) => handleInputChange("futureDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="futureDescription">Your Future Self Identity</Label>
                <div className="relative">
                  <Textarea
                    id="futureDescription"
                    placeholder="Describe who you will have become and how you will be living..."
                    value={formData.futureDescription}
                    onChange={(e) => handleInputChange("futureDescription", e.target.value)}
                    className="min-h-32 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() =>
                      isListening === "futureDescription"
                        ? stopVoiceRecognition()
                        : startVoiceRecognition("futureDescription")
                    }
                  >
                    {isListening === "futureDescription" ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={generatePrompt} disabled={!isFormValid} className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Connect with Future Self
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Prompt Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Your Future Self Story</CardTitle>
              <CardDescription>A personalized narrative connecting you with your future identity</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPrompt ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{generatedPrompt}</pre>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={copyToClipboard} className="w-full">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Your Story
                    </Button>
                    <Button onClick={savePrompt} variant="outline" className="w-full">
                      Save to My Stories
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete the form and click "Connect with Future Self" to generate your personalized story.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <blockquote className="text-center">
              <p className="text-lg italic text-foreground font-medium text-balance">
                "That future version of you already exists in the space-time continuum. The AI Merge Framework helps you
                connect with that identity with clarity and depth."
              </p>
              <footer className="text-sm text-muted-foreground mt-2">— AI Merge Framework</footer>
            </blockquote>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-primary">About AI Merge</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The AI Merge Framework is a peer-reviewed system published in the Mensa Research Journal that
                demonstrates how human potential can be radically amplified by merging the subconscious mind with
                artificial intelligence. This Self-Identity preview is one of five pillars designed to help you build a
                super-intelligent version of your own mind.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Purpose</span>
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full">Self-Identity</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Relationships</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Creativity & Courage</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Time & Peace of Mind</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
