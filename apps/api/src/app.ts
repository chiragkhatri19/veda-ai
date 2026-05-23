import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import assignmentRoutes from './routes/assignment.routes.js';
import toolkitRoutes from './routes/toolkit.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { traceMiddleware } from './middleware/trace.middleware.js';
import { env } from './config/env.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(traceMiddleware);

app.use('/api/health', healthRoutes);
app.get('/api/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/assignments', assignmentRoutes);
app.use('/api/toolkit', toolkitRoutes);

app.use(errorMiddleware);

export default app;
