import http from 'http';
import app from './app.js';
import { initSocketServer, disconnectSocketRedis } from './socket/socket.server.js';
import { connectDatabase } from './config/database.js';
import { disconnectRedis } from './config/redis.js';
import { startWorker } from './queues/worker.js';
import { startRubricWorker } from './queues/rubricWorker.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = http.createServer(app);
  initSocketServer(server);
  const generationWorker = startWorker();
  const rubricWorker = startRubricWorker();

  server.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`, { env: env.NODE_ENV });
  });

  const shutdown = async (): Promise<void> => {
    logger.info('Shutting down gracefully...');
    // Close workers first: waits for active jobs to complete before disconnecting
    await Promise.allSettled([generationWorker.close(), rubricWorker.close()]);
    await Promise.allSettled([disconnectRedis(), disconnectSocketRedis()]);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err: Error) => {
  logger.error('Failed to start server', { message: err.message });
  process.exit(1);
});
