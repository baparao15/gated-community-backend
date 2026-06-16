require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./utils/socket');
const { scheduleMonthlyInvoices } = require('./jobs/invoiceJob');
const { scheduleOverdueCheck } = require('./jobs/overdueJob');
const { scheduleVisitorCleanup } = require('./jobs/visitorCleanup');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  // Start scheduled jobs
  scheduleMonthlyInvoices();
  scheduleOverdueCheck();
  scheduleVisitorCleanup();

  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection:', err);
    server.close(() => process.exit(1));
  });
};

start();
