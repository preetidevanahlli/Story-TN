"use client";
import { useState, useRef, ChangeEvent } from "react";

type Props = {
  initialVoiceId?: string | null;
};

export default function VoiceUploadSection({ initialVoiceId = null }: Props) {
  const [uploading, setUploading] = useState(false);
  const [voiceId, setVoiceId] = useState<string | null>(initialVoiceId);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [playing, setPlaying] = useState(false);

async function previewVoice() {
  const res = await fetch('/api/audio/preview', {
    method: 'POST',
    body: JSON.stringify({ text: 'This is a preview of your custom voice' })
  });
  const audioBlob = await res.blob();
  setPreviewUrl(URL.createObjectURL(audioBlob));
}
  async function handleVoiceUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    // create local preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const formData = new FormData();
      formData.append("voice", file);

      const res = await fetch("/api/voice-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Upload failed");
      }

      const json = await res.json().catch(() => ({}));
      if (json?.voiceId) {
        setVoiceId(json.voiceId);
      }

      alert("Voice uploaded and linked to your account.");
    } catch (err: any) {
      console.error("voice upload error:", err);
      setError(err?.message || "Upload failed");
      alert("Voice upload failed.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="container mx-auto px-4 py-8 max-w-4xl bg-card rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-2">Personalize Your Audio Stories</h2>
      <p className="mb-4">Upload a short voice sample (10–30s, WAV or MP3). This will be used for TTS for your $9 plan.</p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label className="cursor-pointer inline-flex items-center px-3 py-2 border rounded-md bg-primary/5">
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            onChange={handleVoiceUpload}
            className="hidden"
            disabled={uploading}
          />
          <span className="text-sm">{uploading ? "Uploading..." : "Choose audio file"}</span>
        </label>

        <div>
          <div className="text-sm">Current voice:</div>
          <div className="font-medium">{voiceId ? voiceId : "No voice uploaded"}</div>
        </div>
      </div>

      {previewUrl && (
        <div className="mt-4">
          <div className="text-sm mb-1">Preview:</div>
          <audio controls src={previewUrl} className="w-full" />
        </div>
      )}

      {error && <div className="mt-3 text-sm text-red-600">Error: {error}</div>}

      <p className="mt-4 text-xs text-muted-foreground">Tip: clear, quiet recordings with a single speaker work best.</p>
    </section>
  );
}