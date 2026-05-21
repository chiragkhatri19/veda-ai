import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    // Map each issue to { "field.path": "first message" } — no raw Zod tree exposed
    const errors = err.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = issue.path.length > 0 ? issue.path.join('.') : '_form';
      if (!acc[key]) acc[key] = issue.message;
      return acc;
    }, {});

    res.status(400).json({
      message: 'Request validation failed.',
      errors,
    });
    return;
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack });

  // Never expose raw internal error messages in production
  const safeMessage =
    env.NODE_ENV === 'production' ? 'An internal server error occurred.' : (err.message || 'Internal server error');

  res.status(500).json({ message: safeMessage });
}
