import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../shared/utils/auth.util';
import { AppError } from '../shared/errors/AppError';
import prisma from '../database/client';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Unauthorized', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            include: {
                student: true,
                expert: true,
                admin: true,
                parent: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        next(new AppError('Unauthorized', 401));
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Unauthorized', 401));
        }

        const userRole = getUserRole(req.user);
        if (!roles.includes(userRole)) {
            return next(new AppError('Forbidden', 403));
        }

        next();
    };
};

function getUserRole(user: any): string {
    if (user.admin) return 'ADMIN';
    if (user.expert) return 'EXPERT';
    if (user.student) return 'STUDENT';
    if (user.parent) return 'PARENT';
    return 'USER';
}
