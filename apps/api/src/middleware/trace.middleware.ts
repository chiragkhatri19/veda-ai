import type { Request, Response, NextFunction } from 'express';

export interface TracedRequest extends Request {
  traceId?: string;
}

export function traceMiddleware(req: TracedRequest, res: Response, next: NextFunction): void {
  const incoming = req.headers['x-request-id'] ?? req.headers['x-trace-id'];
  req.traceId = typeof incoming === 'string' ? incoming : crypto.randomUUID();
  res.setHeader('X-Request-ID', req.traceId);
  next();
}
