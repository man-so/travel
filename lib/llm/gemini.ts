type GeminiGenerateInput = {
  prompt: string;
  jsonSchema: unknown;
};

type GeminiInteractionResponse = {
  output_text?: string;
  interaction?: {
    output_text?: string;
  };
  steps?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
    type?: string;
  }>;
};

class GeminiRequestError extends Error {
  status: number;

  constructor(status: number) {
    super(`Gemini request failed. (${status})`);
    this.status = status;
  }
}

function readGeminiApiKeys() {
  const keys = [
    ...(process.env.GEMINI_API_KEYS ?? '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean),
    process.env.GEMINI_API_KEY,
  ].filter(Boolean) as string[];

  return Array.from(new Set(keys));
}

export function hasGeminiConfig() {
  return readGeminiApiKeys().length > 0;
}

function getGeminiConfig() {
  const apiKeys = readGeminiApiKeys();
  const model = process.env.GEMINI_MODEL || 'gemini-3.7-flash';

  if (apiKeys.length === 0) {
    throw new Error('Gemini API key is not configured.');
  }

  return { apiKeys, model };
}

function readOutputText(data: GeminiInteractionResponse) {
  const directText = data.output_text ?? data.interaction?.output_text;
  if (directText) {
    return directText;
  }

  return (
    data.steps
      ?.flatMap((step) => step.content ?? [])
      .filter((content) => content.type === 'text' && content.text)
      .map((content) => content.text)
      .join('\n') ?? ''
  );
}

export function cleanJsonOutput(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export async function generateWithGemini({
  prompt,
  jsonSchema,
}: GeminiGenerateInput) {
  const { apiKeys, model } = getGeminiConfig();
  let lastError: unknown;

  for (const apiKey of apiKeys) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/interactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            model,
            input: prompt,
            response_format: {
              type: 'text',
              mime_type: 'application/json',
              schema: jsonSchema,
            },
          }),
          signal: AbortSignal.timeout(30000),
        },
      );

      if (!response.ok) {
        throw new GeminiRequestError(response.status);
      }

      const data = (await response.json()) as GeminiInteractionResponse;
      const text = readOutputText(data);

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      return cleanJsonOutput(text);
    } catch (error) {
      lastError = error;

      if (
        error instanceof GeminiRequestError &&
        (error.status === 429 || error.status === 403)
      ) {
        continue;
      }

      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Gemini request failed.');
}
