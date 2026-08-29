import { generateWithGemini } from '@/lib/llm/gemini';

export async function generate({
  prompt,
  jsonSchema,
}: {
  prompt: string;
  jsonSchema: unknown;
}) {
  return generateWithGemini({ prompt, jsonSchema });
}
