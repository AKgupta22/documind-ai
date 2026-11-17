import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  console.error(
    '[api] Unhandled request error:',
    error instanceof Error ? error.message : String(error),
  );

  response.status(500).json({ error: 'Internal Server Error' });
};
