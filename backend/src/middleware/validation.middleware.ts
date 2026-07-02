import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError';

export const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const message = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            return next(new AppError(message, 400));
        }
        next(error);
    }
};
