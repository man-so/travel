import { z } from 'zod';

export const companionSchema = z.enum(['solo', 'couple', 'friends', 'family']);

export const journeySchema = z
  .object({
    title: z.string().trim().optional(),
    destination: z.string().trim().min(1, 'Destination is required.'),
    country: z.string().trim().optional(),
    startDate: z.string().trim().min(1, 'Start date is required.'),
    endDate: z.string().trim().min(1, 'End date is required.'),
    companion: companionSchema.default('solo'),
  })
  .refine((value) => new Date(value.startDate) <= new Date(value.endDate), {
    message: 'End date must be after start date.',
    path: ['endDate'],
  });

export const entrySchema = z.object({
  dayId: z.string().min(1),
  place: z.string().trim().min(1, 'Place is required.'),
  content: z.string().max(2000).default(''),
  photoUrl: z.string().trim().optional(),
});
