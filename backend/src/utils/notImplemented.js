/**
 * Placeholder handler for endpoints whose access rules are in place but whose logic is not built yet
 * (waiting on the database schema). Reaching it means authentication and authorization already passed.
 */
export function notImplemented(req, res) {
  res.status(501).json({
    success: false,
    message: `${req.method} ${req.baseUrl}${req.route?.path === '/' ? '' : (req.route?.path ?? '')} is not implemented yet`,
  });
}
