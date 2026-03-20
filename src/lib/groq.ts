import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

if (!process.env.GROQ_API_KEY) {
  console.error("Groq Error: GROQ_API_KEY is missing from .env.local");
}

export const MODEL_FAST = 'llama-3.1-8b-instant';
export const MODEL_SMART = 'llama-3.3-70b-versatile';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGroq(
  prompt: string,
  model: string = MODEL_SMART,
  systemPrompt: string = 'You are a helpful assistant.'
): Promise<string> {
  const maxRetries = 3;
  const backoffMs = [1000, 2000, 4000];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await groq.chat.completions.create(
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        },
        { signal: controller.signal }
      );

      clearTimeout(timeout);
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw new Error(
          `Groq API failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
      await sleep(backoffMs[attempt]);
    }
  }

  throw new Error('Groq API failed: no response');
}

export async function callGroqJSON<T>(
  prompt: string,
  model: string = MODEL_SMART,
  systemPrompt: string = 'You are a helpful assistant. Always respond with valid JSON only, no markdown formatting.'
): Promise<T> {
  const maxRetries = 3;
  const backoffMs = [1000, 2000, 4000];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await groq.chat.completions.create(
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
        },
        { signal: controller.signal }
      );

      clearTimeout(timeout);
      const content = response.choices[0]?.message?.content || '{}';

      // Strip markdown code fences if present
      const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw new Error(
          `Groq JSON API failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
      await sleep(backoffMs[attempt]);
    }
  }

  throw new Error('Groq JSON API failed: no response');
}
