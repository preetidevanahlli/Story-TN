import axios from "axios";
import FormData from "form-data";

// Add export keyword if missing
export async function createElevenLabsVoice(audioBuffer: Buffer, userEmail: string) {
  try {
    const formData = new FormData();
    formData.append("name", userEmail);
    formData.append("files", audioBuffer, { filename: "voice.wav" });

    const res = await axios.post(
      "https://api.elevenlabs.io/v1/voices/add",
      formData,
      {
        validateStatus: () => true,
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          ...formData.getHeaders(),
        },
      }
    );

    if (res.status >= 400) {
      throw new Error(res.data?.detail?.message || "Voice creation failed");
    }
    return res.data.voice_id;
  } catch (err) {
    console.error("ElevenLabs voice creation error:", err);
    throw err;
  }
}
// Also ensure the elevenlabs object is exported
export const elevenlabs = {
  textToSpeech: {
    async convert({ 
      voice_id, 
      model_id, 
      text,
      voice_settings
    }: { 
      voice_id: string, 
      model_id: string, 
      text: string,
      voice_settings?: {
        stability?: number,
        similarity_boost?: number,
        style?: number,
        speaker_boost?: boolean
      }
    }) {
      const apiKey = process.env.ELEVENLABS_API_KEY!;
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_id,
          text,
          ...(voice_settings ? { voice_settings } : {})
        }),
      });
      return res;
    }
  }
};