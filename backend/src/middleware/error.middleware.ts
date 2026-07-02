import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';
import { config } from '../config/env.config';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    let { statusCode, message } = err;

    if (!(err instanceof AppError)) {
        statusCode = 500;
        message = config.env === 'production' ? 'Internal Server Error' : err.message;
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(config.env === 'development' && { stack: err.stack }),
    };

    if (config.env === 'development') {
        console.error(err);
    }

    res.status(statusCode).send(response);
};
