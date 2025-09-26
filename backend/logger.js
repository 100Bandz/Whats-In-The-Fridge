// backend/logger.js
import fs from 'fs';
import path from 'path';

const logFile = path.resolve('./logs/api.log');

export function apiLogger(req, res, next) {
  const start = Date.now();
  const { method, url, body } = req;

  // capture response status after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method,
      url,
      body,
      status: res.statusCode,
      duration,
    };
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  });

  next();
}
