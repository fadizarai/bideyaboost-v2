import { z } from 'zod';

const multilingualSchema = z.object({
    en: z.string().optional(),
    fr: z.string().optional(),
    ar: z.string().optional(),
});

export const createEventSchema = z.object({
    multilingualTitle: multilingualSchema,
    multilingualDescription: multilingualSchema.optional(),
    multilingualLocation: multilingualSchema.optional(),
    type: z.string(),
    date: z.string().transform((str) => new Date(str)),
    time: z.string().optional(),
    clubId: z.string().uuid().optional(),
    capacity: z.number().int().optional(),
    maxRegistrations: z.number().int().optional(),
    deadline: z.string().transform((str) => new Date(str)).optional(),
    speaker: z.string().optional(),
    company: z.string().optional(),
    category: z.string().optional(),
    duration: z.string().optional(),
    level: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().url().optional(),
    status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).default('UPCOMING'),
});

export const registerEventSchema = z.object({
    eventId: z.string().uuid(),
});
