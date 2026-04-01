import { sendError } from '../utils/response.js';

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (err.statusCode === 500) {
    console.error('SERVER ERROR:', err);
  }
  return sendError(res, err.message, err.statusCode);
};

export default globalErrorHandler;
