import { z } from 'zod';

export const aiImportPlaceSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  source: z.enum(['article', 'ai_suggestion']),
});

export const aiImportDaySchema = z.object({
  day: z.number().int().min(1),
  places: z.array(aiImportPlaceSchema),
});

export const aiImportPlanSchema = z.object({
  status: z.enum(['clarification', 'plan']),
  contentType: z.string().min(1),
  destination: z.string().nullable(),
  durationDays: z.number().int().min(1).nullable(),
  question: z.string().nullable(),
  options: z.array(z.string()),
  days: z.array(aiImportDaySchema),
  requiresDurationConfirmation: z.boolean().optional(),
  durationNote: z.string().optional(),
});

export type AiImportPlan = z.infer<typeof aiImportPlanSchema>;

export const aiImportRequestSchema = z.object({
  url: z.url(),
  clarificationChoice: z.string().min(1).optional(),
  journey: z.object({
    destination: z.string().min(1),
    country: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    dayCount: z.number().int().min(1),
  }),
});

export type AiImportRequest = z.infer<typeof aiImportRequestSchema>;

export const aiImportJsonSchema = z.toJSONSchema(aiImportPlanSchema, {
  target: 'draft-7',
});
