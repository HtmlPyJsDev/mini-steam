// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('[mini-steam] Error:', err);

  if (err && err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.fromEntries(
        Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
      ),
    });
  }

  if (err && err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  if (err && err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate value',
      fields: err.keyValue || {},
    });
  }

  if (err && err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  const status = err && err.status ? err.status : 500;
  return res.status(status).json({
    message: (err && err.message) || 'Internal server error',
  });
}

module.exports = errorHandler;
