import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { JobProgressEvent } from '@veda/shared';

const PROGRESS_CHANNEL = 'assignment:progress:events';

let io: SocketIOServer;
let pubClient: Redis;
let subClient: Redis;

export function initSocketServer(server: HttpServer): void {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Dedicated pub/sub connections (cannot share a connection in subscribe mode)
  pubClient = new Redis(env.REDIS_URL);
  subClient = new Redis(env.REDIS_URL);

  pubClient.on('error', (err) => logger.error('Redis pubClient error', { message: err.message }));
  subClient.on('error', (err) => logger.error('Redis subClient error', { message: err.message }));

  subClient.subscribe(PROGRESS_CHANNEL, (err) => {
    if (err) {
      logger.error('Failed to subscribe to Redis Pub/Sub channel', { message: err.message });
    } else {
      logger.info('Subscribed to Redis assignment progress Pub/Sub channel');
    }
  });

  subClient.on('message', (channel, message) => {
    if (channel === PROGRESS_CHANNEL && io) {
      const { assignmentId, event } = JSON.parse(message) as { assignmentId: string; event: JobProgressEvent };
      io.to(`assignment:${assignmentId}`).emit('job:progress', event);
      logger.debug('Broadcasted progress event from Pub/Sub', { assignmentId, status: event.status });
    }
  });

  io.on('connection', (socket) => {
    logger.debug('Client connected', { socketId: socket.id });

    socket.on('subscribe:assignment', async (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      logger.debug('Client subscribed', { socketId: socket.id, assignmentId });

      // Push cached progress immediately so reconnecting clients catch up
      try {
        const cached = await pubClient.get(`assignment:progress:${assignmentId}`);
        if (cached) {
          const event = JSON.parse(cached) as JobProgressEvent;
          socket.emit('job:progress', event);
          logger.debug('Synced cached progress to reconnecting client', { assignmentId });
        }
      } catch (err) {
        logger.error('Failed to sync cached progress', { error: (err as Error).message });
      }
    });

    socket.on('unsubscribe:assignment', (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on('disconnect', () => {
      logger.debug('Client disconnected', { socketId: socket.id });
    });
  });

  logger.info('Socket.IO server initialized');
}

export function emitJobProgress(assignmentId: string, event: JobProgressEvent): void {
  if (!pubClient) {
    // Fallback to direct emit in single-process dev mode
    if (io) io.to(`assignment:${assignmentId}`).emit('job:progress', event);
    return;
  }
  pubClient.publish(PROGRESS_CHANNEL, JSON.stringify({ assignmentId, event }));
}

export async function disconnectSocketRedis(): Promise<void> {
  await Promise.allSettled([
    pubClient?.quit(),
    subClient?.quit(),
  ]);
}
