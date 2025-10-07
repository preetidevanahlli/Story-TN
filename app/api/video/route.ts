import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import googleTTS from 'google-tts-api';

async function getAccessToken(): Promise<string | null> {
  if (process.env.GOOGLE_API_KEY) return null;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      const auth = new GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
      const client = await auth.getClient();
      const res = await client.getAccessToken();
      const token = typeof res === 'string' ? res : res?.token;
      return token || null;
    } catch (err) {
      console.error('Service account key failure:', err);
      throw new Error('Failed to generate access token from service account key');
    }
  }

  try {
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const res = await client.getAccessToken();
    const token = typeof res === 'string' ? res : res?.token;
    return token || null;
  } catch (err) {
    console.warn('No application default credentials available:', err);
    return null;
  }
}

function buildScriptFromInput(userInput: any) {
  if (typeof userInput === 'string') {
    return [userInput];
  }

  const safe = (k: string) => (userInput && userInput[k]) ? String(userInput[k]).trim() : '';
  const name = safe('name') || safe('lifeJourney') || 'I';
  const occupation = safe('occupation');
  const background = safe('background');
  const goals = safe('goals') || safe('deepestDesires');
  const challenges = safe('challenges') || safe('currentStruggles');

  const script: string[] = [];
  script.push(`${name}${occupation ? ` is an ${occupation}` : ''} who set out to build a better life.`);
  if (background) script.push(`They were shaped by ${background.split('.').slice(0,2).join('. ')}.`);
  if (challenges) script.push(`Along the way, they faced challenges: ${challenges.split('.').slice(0,1).join('. ')}.`);
  script.push(`They kept moving forward, learning and growing each day.`);
  if (goals) script.push(`Today, they are closer to their goal: ${goals.split('.').slice(0,2).join('. ')}.`);
  script.push(`This is a short glimpse of their journey toward a life of purpose and meaning.`);

  return script;
}

async function synthesizeSpeech(text: string, accessToken: string | null) {
  // Use Google Text-to-Speech API v1: https://texttospeech.googleapis.com/v1/text:synthesize
  // If GOOGLE_API_KEY is set, use key; otherwise use accessToken.
  const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  const body = {
    input: { text },
    voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const headers: any = { 'Content-Type': 'application/json' };
  const params: any = {};
  if (process.env.GOOGLE_API_KEY) params.key = process.env.GOOGLE_API_KEY;
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  // If we have a Google Cloud API key or access token, prefer the official API
  if (process.env.GOOGLE_API_KEY || accessToken) {
    const res = await axios.post(url, body, { headers, params });
    if (res?.data?.audioContent) {
      return Buffer.from(res.data.audioContent, 'base64');
    }
    throw new Error('TTS returned no audio (Google TTS)');
  }

  // Fallback: use google-tts-api (unofficial) for free TTS
  try {
    // google-tts-api returns a URL - fetch the mp3 and return as buffer
    const ttsUrl = googleTTS.getAudioUrl(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });
    const r = await axios.get(ttsUrl, { responseType: 'arraybuffer' });
    return Buffer.from(r.data);
  } catch (err) {
    console.error('google-tts-api fallback failed:', err);
    throw new Error('TTS failed (no Google credentials and fallback failed)');
  }
}

async function downloadPlaceholderImage(destPath: string) {
  // Use picsum to grab a random image of 1280x720
  const imageUrl = 'https://picsum.photos/1280/720';
  const resp = await axios.get(imageUrl, { responseType: 'stream' });
  const writer = fs.createWriteStream(destPath);
  return new Promise<void>((resolve, reject) => {
    resp.data.pipe(writer);
    writer.on('finish', () => resolve());
    writer.on('error', (err) => reject(err));
  });
}

function runFfmpegBuild(tmpDir: string, imageFiles: string[], audioFile: string, outFile: string) {
  return new Promise<void>((resolve, reject) => {
    // Create list.txt for ffmpeg concat demuxer
    const listPath = path.join(tmpDir, 'list.txt');
    const stream = fs.createWriteStream(listPath);
    for (const img of imageFiles) {
      stream.write(`file '${img.replace(/\\/g, '/')}'\n`);
      stream.write(`duration 4\n`); // 4 seconds per image
    }
    // repeat last image to ensure duration
    stream.write(`file '${imageFiles[imageFiles.length - 1].replace(/\\/g, '/')}\n`);
    stream.end();

    const ffmpegArgs = ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-i', audioFile, '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p', '-shortest', outFile];

    const ff = spawn('ffmpeg', ffmpegArgs, { stdio: 'inherit' });
    ff.on('error', (err) => reject(new Error(`ffmpeg spawn failed: ${err.message}`)));
    ff.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userInput = body?.userInput || body;
    if (!userInput) return NextResponse.json({ error: 'User input required' }, { status: 400 });

    // Build a short scene script
    const scriptLines = buildScriptFromInput(userInput);

    // Get access token or use API key
    const accessToken = await getAccessToken();
    if (!accessToken && !process.env.GOOGLE_API_KEY) {
      // Still allow: we can create a video without audio (or return guidance)
      return NextResponse.json({ error: 'No Google credentials available for TTS. Set GOOGLE_API_KEY or service account.' }, { status: 400 });
    }

    // Synthesize combined text
    const combinedText = scriptLines.join(' \n ');
    const audioBuffer = await synthesizeSpeech(combinedText, accessToken);

    // Prepare temp dir
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-video-'));
    const audioPath = path.join(tmpDir, 'audio.mp3');
    fs.writeFileSync(audioPath, audioBuffer);

    // Download placeholder images for each scene
    const imageFiles: string[] = [];
    for (let i = 0; i < scriptLines.length; i++) {
      const p = path.join(tmpDir, `img${i}.jpg`);
      await downloadPlaceholderImage(p);
      imageFiles.push(p);
    }

    const outFile = path.join(tmpDir, 'out.mp4');

    // Run ffmpeg to build the video
    try {
      await runFfmpegBuild(tmpDir, imageFiles, audioPath, outFile);
    } catch (ffErr) {
      console.error('ffmpeg build failed:', ffErr);
      return NextResponse.json({ error: 'ffmpeg not found or failed. Please install ffmpeg to enable video generation.' }, { status: 500 });
    }

    const videoBuffer = fs.readFileSync(outFile);
    // Clean up could be done asynchronously

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(videoBuffer.length),
      },
    });
  } catch (err: any) {
    console.error('Video generation error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate video' }, { status: 500 });
  }
}
