const { randomUUID } = require('crypto');

const correlationId = (req, res, next) => {
  const incoming = req.headers['x-correlation-id'];
  const value = typeof incoming === 'string' && incoming.trim() ? incoming.trim() : randomUUID();

  req.correlationId = value;
  res.setHeader('x-correlation-id', value);
  next();
};

module.exports = correlationId;
