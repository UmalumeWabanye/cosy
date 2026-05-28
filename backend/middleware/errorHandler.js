const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server error';
  const correlationId = req?.correlationId || req?.headers?.['x-correlation-id'] || '';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  const logPayload = {
    correlationId,
    method: req?.method,
    path: req?.originalUrl || req?.url,
    statusCode,
    message,
  };

  if (statusCode >= 500) {
    console.error('[error]', logPayload, err?.stack || err);
  } else {
    console.warn('[warn]', logPayload);
  }

  res.status(statusCode).json({
    message,
    correlationId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
