// middleware/logger.js — Simple request logger for development
const logger = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') return next();

  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const ms   = Date.now() - start;
    const code = res.statusCode;
    const color =
      code >= 500 ? '\x1b[31m' :  // red
      code >= 400 ? '\x1b[33m' :  // yellow
      code >= 300 ? '\x1b[36m' :  // cyan
                    '\x1b[32m';   // green

    console.log(`${color}${method} ${originalUrl} ${code}\x1b[0m — ${ms}ms`);
  });

  next();
};

module.exports = logger;
