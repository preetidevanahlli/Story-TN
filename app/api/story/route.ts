import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

// This route supports three ways to authenticate with Google's Generative Language API:
// 1) Set GOOGLE_API_KEY in your environment: we'll call the API with ?key=API_KEY (simple, fine for server-side testing).
// 2) Set GOOGLE_SERVICE_ACCOUNT_KEY to the JSON key (stringified) or set GOOGLE_APPLICATION_CREDENTIALS to a path: we'll use the service account to mint an access token.
// 3) In development only: if no credentials are set, we return a mock story so the frontend can be tested without failing.

async function getAccessToken(): Promise<string | null> {
  // Prefer API key (no access token required)
  if (process.env.GOOGLE_API_KEY) {
    console.log('Using GOOGLE_API_KEY for requests.');
    return null;
  }

  // Use service account JSON provided directly in env
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      const auth = new GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
      const client = await auth.getClient();
      const res = await client.getAccessToken();
      const token = typeof res === 'string' ? res : res?.token;
      console.log('Generated access token using GOOGLE_SERVICE_ACCOUNT_KEY.');
      return token || null;
    } catch (err) {
      console.error('Failed to generate access token from GOOGLE_SERVICE_ACCOUNT_KEY:', err);
      throw new Error('Failed to generate access token from service account key');
    }
  }

  // Use application default credentials (GOOGLE_APPLICATION_CREDENTIALS or environment)
  try {
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const res = await client.getAccessToken();
    const token = typeof res === 'string' ? res : res?.token;
    if (token) {
      console.log('Generated access token using application default credentials.');
      return token;
    }
  } catch (err) {
    // We'll not throw here immediately because we may want to fall back to dev mock below
    console.warn('Application default credentials did not yield an access token:', err);
  }

  // No credentials available
  return null;
}

function buildDevMockStory(userInput: any) {
  // If the userInput is a simple string, return a short polished paragraph
  if (typeof userInput === 'string') {
    return `I remember the first time I felt the stirrings of change. What began as a small, quiet hope grew into a steady, courageous pursuit. Each day I moved a little closer to the life I wanted, and today I stand with that dream realized.`
  }

  // For object-shaped input (form), extract common fields safely
  const safe = (k: string) => (userInput && userInput[k]) ? String(userInput[k]).trim() : ''
  const name = safe('name') || safe('lifeJourney') || ''
  const age = safe('age')
  const occupation = safe('occupation')
  const background = safe('background') || safe('lifeJourney')
  const goals = safe('goals') || safe('deepestDesires')
  const challenges = safe('challenges') || safe('currentStruggles')
  const values = safe('values') || safe('goodThingsPast')

  // Build a vivid, first-person narrative using a few short paragraphs
  const parts: string[] = []

  // Opening hook
  const opener = name
    ? `My name is ${name}${age ? `, and I am ${age}` : ''}.` 
    : `I remember the day everything shifted for me.`
  parts.push(`${opener} ${occupation ? `As an ${occupation},` : ''} I have always been drawn to work that challenges me and asks for creative thinking.`)

  // Backstory and stakes
  if (background) {
    const shortBg = background.length > 400 ? background.slice(0, 400) + '...' : background
    parts.push(`I grew up shaped by ${shortBg}. Those roots taught me resilience, curiosity, and the quiet power of steady effort.`)
  }

  // The struggle
  if (challenges) {
    parts.push(`There were times when the path felt heavy. ${challenges.split('.')[0] || challenges} But each setback taught me how to gather myself, learn the lesson, and move forward with more clarity.`)
  }

  // The turning point
  parts.push(`A turning point came when I decided to treat every small step as a vote for the future I wanted. I focused on building skills, asking the right questions, and showing up even when progress felt tiny.`)

  // Achievements and transformation
  if (goals) {
    const shortGoals = goals.length > 300 ? goals.slice(0, 300) + '...' : goals
    parts.push(`Those efforts changed everything. Over time I began to see real movement toward my goals: ${shortGoals}. The work was quiet, but it was relentless, and the results followed.`)
  } else {
    parts.push(`Those efforts changed everything. The slow work added up, and I began to live more of the life I had imagined.`)
  }

  // Values and closing reflection
  if (values) {
    parts.push(`At the heart of this journey are my values: ${values}. They kept me honest, grounded, and kind along the way.`)
  }

  parts.push(`Now, when I look back, I feel grateful and surprised by how far I've come. The future still calls me forward, but I stand taller knowing that I can meet it with purpose and courage.`)

  // Join into a story with paragraph breaks
  return parts.join('\n\n')
}

export async function POST(request: Request) {
  try {
    // Diagnostic: log which Google-related env vars are present (not their values)
    console.log('ENV DIAGNOSTIC:', {
      NODE_ENV: process.env.NODE_ENV,
      HAS_GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
      HAS_SERVICE_ACCOUNT_KEY: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      HAS_APPLICATION_CREDENTIALS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    const body = await request.json();
    const userInput = body?.userInput || body;

    if (!userInput) {
      return NextResponse.json({ error: 'User input is required' }, { status: 400 });
    }

    // Short-circuit in development to avoid OAuth refresh token errors while iterating locally.
    if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_API_KEY && !process.env.GOOGLE_SERVICE_ACCOUNT_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Development fallback active: returning mock story.');
      const mockStory = buildDevMockStory(userInput);
      return NextResponse.json({ story: mockStory });
    }

    // Attempt to get an access token. If getAccessToken returns null and GOOGLE_API_KEY is set, we'll use the key.
    const accessToken = await getAccessToken();

    // If no credentials are available, provide a helpful developer fallback to avoid 500s during local dev.
    const hasApiKey = !!process.env.GOOGLE_API_KEY;
    const hasAccessToken = !!accessToken;

    if (!hasApiKey && !hasAccessToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No Google credentials found — returning development mock story (post-auth attempt).');
        const mockStory = buildDevMockStory(userInput);
        return NextResponse.json({ story: mockStory });
      }

      return NextResponse.json({ error: 'No Google credentials configured. Set GOOGLE_API_KEY or service account credentials.' }, { status: 500 });
    }

    // Build request to Generative Language API
    // Prefer API key (simpler). If using API key, append ?key=
    const apiBase = 'https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateContent';

    let url = apiBase;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (hasApiKey) {
      url = `${apiBase}?key=${encodeURIComponent(process.env.GOOGLE_API_KEY as string)}`;
    } else if (hasAccessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Payload: adjust to the API shape you need. This is a minimal example.
    const payload = {
      prompt: userInput,
      // depending on the API version you might need to change field names (prompt vs input etc.)
    };

    console.log('Calling Generative Language API:', { url, headers: Object.keys(headers) });

    const response = await axios.post(url, payload, { headers });

    console.log('Generative Language API response status:', response.status);
    console.log('Generative Language API response data:', response.data);

    // Try to extract a story from common response shapes
    const story = response.data?.story || response.data?.candidates?.[0]?.content || response.data?.output || response.data;

    return NextResponse.json({ story });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error generating story (axios):', error.response?.data || error.message);
      return NextResponse.json({ error: error.response?.data || 'Failed to generate story' }, { status: error.response?.status || 500 });
    }

    console.error('Unexpected error generating story:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}