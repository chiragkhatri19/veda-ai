import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      code: err.errorCode,
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    const errors = err.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = issue.path.length > 0 ? issue.path.join('.') : '_form';
      if (!acc[key]) acc[key] = issue.message;
      return acc;
    }, {});
    res.status(400).json({ status: 'error', code: 'VALIDATION_ERROR', errors });
    return;
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack });

  const safeMessage =
    env.NODE_ENV === 'production' ? 'An internal server error occurred.' : (err.message || 'Internal server error');

  res.status(500).json({ status: 'error', code: 'INTERNAL_SERVER_ERROR', message: safeMessage });
}
