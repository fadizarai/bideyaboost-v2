import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.enum(['STUDENT', 'EXPERT', 'ADMIN', 'PARENT']),
    roleData: z.record(z.string(), z.any()).optional(), // Data for the specific role entity
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
