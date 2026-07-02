import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.config';

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (payload: any, expiresIn: string | number): string => {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, config.jwt.secret);
};
