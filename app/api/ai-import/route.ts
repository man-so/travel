import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { extractUrlContent } from '@/lib/ai-import/content-extraction';
import { generateAiImportPlan } from '@/lib/ai-import/generate-plan';
import { aiImportRequestSchema } from '@/lib/ai-import/schema';
import { hasGeminiConfig } from '@/lib/llm/gemini';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body.' } },
      { status: 400 },
    );
  }

  const input = aiImportRequestSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid import request.' } },
      { status: 400 },
    );
  }

  if (!hasGeminiConfig()) {
    return NextResponse.json(
      { error: { code: 'AI_IMPORT_ERROR', message: 'Gemini is not configured.' } },
      { status: 503 },
    );
  }

  try {
    const content = await extractUrlContent(input.data.url);
    const plan = await generateAiImportPlan({
      content,
      journey: input.data.journey,
      clarificationChoice: input.data.clarificationChoice,
    });

    return NextResponse.json({
      content: {
        title: content.title,
        url: content.url,
      },
      plan,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'AI_IMPORT_ERROR',
            message: 'Gemini returned an invalid structured plan.',
          },
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'AI_IMPORT_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to import this URL.',
        },
      },
      { status: 500 },
    );
  }
}
