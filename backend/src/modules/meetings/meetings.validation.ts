import { z } from 'zod';

export const createMeetingSchema = z.object({
    expertId: z.string().uuid(),
    date: z.string().transform((str) => new Date(str)),
    time: z.string().optional(),
    notes: z.string().optional(),
});

export const updateMeetingStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
});

export const createVideoMeetingSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    scheduledAt: z.string().transform((str) => new Date(str)),
    participantIds: z.array(z.string().uuid()).optional(),
});
