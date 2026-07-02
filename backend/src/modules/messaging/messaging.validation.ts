import { z } from 'zod';

export const createConversationSchema = z.object({
    participantIds: z.array(z.string().uuid()),
    type: z.enum(['PRIVATE', 'GROUP', 'ADMIN', 'EDUCATIONAL']).optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    avatar: z.string().url().optional(),
});

export const sendMessageSchema = z.object({
    content: z.string().optional(),
    type: z.enum(['TEXT', 'IMAGE', 'FILE', 'VOICE']).default('TEXT'),
    attachments: z.array(z.object({
        url: z.string().url(),
        type: z.string(),
        name: z.string().optional()
    })).optional(),
    replyToId: z.string().uuid().optional(),
});

export const paginationSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
