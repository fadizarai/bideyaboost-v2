import dotenv from 'dotenv';
import path from 'path';

// Load env only if .env exists, otherwise rely on environment
dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwt: {
        secret: process.env.JWT_SECRET || 'super-secret-key',
        accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES || '30m',
        refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || '30d',
    },
    database: {
        url: process.env.DATABASE_URL,
    },
};
