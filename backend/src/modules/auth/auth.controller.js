import * as authService from './auth.service.js';

export async function me(req, res) {
  const user = await authService.getCurrentUser(req.user);
  res.json({ success: true, data: user });
}
