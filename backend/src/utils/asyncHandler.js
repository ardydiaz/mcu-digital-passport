// Express 5 forwards rejected promises to error handlers automatically.
// This wrapper is kept for explicitness and for any sync/async mix in handlers.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
