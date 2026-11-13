import app from './app.js';
import { env } from './config/environment.js';
import { pool, testConnection } from './config/database.js';
import { logger } from './utils/logger.js';

async function start() {
  try {
    await testConnection();
    logger.info('Database connected');
  } catch (err) {
    logger.error('Database connection failed:', err.message);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
