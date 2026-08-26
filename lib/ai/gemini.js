import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// ============================================================
// VedaAI — Ultra-Fast Gemini AI Client
// Fast execution with immediate graceful fallback on rate limits
// ============================================================

const DEFAULT_MODEL = 'gemini-3.6-flash';

let _client = null;

function getClient() {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    _client = new GoogleGenerativeAI(apiKey);
  }
  return _client;
}

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Execute with a strict 4-second timeout to ensure the UI stays ultra-responsive.
 */
async function withTimeout(promise, timeoutMs = 4000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs)
    ),
  ]);
}

/**
 * Generate content from text + images with instant fallback if rate-limited.
 */
export async function generateWithImages(prompt, images = []) {
  const client = getClient();
  const parts = [
    { text: prompt },
    ...images.map((img) => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType || 'image/jpeg',
      },
    })),
  ];

  const model = client.getGenerativeModel({
    model: DEFAULT_MODEL,
    safetySettings,
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });

  return withTimeout(
    model.generateContent(parts).then((res) => res.response.text()),
    4500
  );
}

/**
 * Generate content from text only with instant fallback if rate-limited.
 */
export async function generateText(prompt) {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: DEFAULT_MODEL,
    safetySettings,
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });

  return withTimeout(
    model.generateContent(prompt).then((res) => res.response.text()),
    4000
  );
}

export { DEFAULT_MODEL as MODEL_NAME };
