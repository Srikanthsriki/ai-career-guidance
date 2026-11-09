const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
let genAI = null;

if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY.trim());
  } catch (err) {
    console.warn('[Gemini AI] Initialization warning:', err.message);
  }
}

/**
 * Call Gemini AI with prompt and optional model
 * Safely parses JSON responses when expected
 */
async function generateGeminiContent(prompt, systemInstruction = '', returnJson = true) {
  // If API Key is not set or empty, use high-fidelity deterministic career intelligence fallback
  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.log('[Gemini AI] No API key detected. Using high-fidelity intelligent domain engine.');
    return null; // Signals controller to use domain-specific fallback logic
  }

  // Older 1.5 / 2.0 models have been shut down by Google, so use current models.
  // Set GEMINI_MODEL in .env (or on Render) to try a specific model first.
  const modelCandidates = [
    process.env.GEMINI_MODEL,
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite'
  ].filter(Boolean);

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || undefined,
        generationConfig: returnJson
          ? { responseMimeType: 'application/json', temperature: 0.3 }
          : { temperature: 0.7 }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (returnJson) {
        try {
          // Clean possible markdown code fences
          const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          return JSON.parse(cleaned);
        } catch (parseErr) {
          console.warn('[Gemini AI] JSON parse failed, returning raw string payload:', parseErr.message);
          return text;
        }
      }
      return text;
    } catch (err) {
      const isQuotaOrRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('Quota');
      console.warn(`[Gemini AI] Model ${modelName} failed (${err.message}).`);
      
      if (isQuotaOrRateLimit) {
        console.warn('[Gemini AI] Rate limit/quota encountered. Halting further API retries.');
        break; // Stop retrying to respect quota rules
      }
    }
  }

  return null; // Fallback to domain engine
}

module.exports = {
  generateGeminiContent,
  hasGeminiKey: () => Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim())
};

