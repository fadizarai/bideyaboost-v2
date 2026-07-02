import { z } from 'zod';

export const createAdminNoteSchema = z.object({
    title: z.string().min(3),
    content: z.string().optional(),
    date: z.string().transform((val) => new Date(val)),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    visibility: z.enum(['PRIVATE', 'SHARED']),
});

export const updateNavConfigSchema = z.object({
    navItem: z.string(),
    ruleType: z.enum(['ROLE', 'SPECIFIC_USER']),
    userId: z.string().uuid().optional(),
});
