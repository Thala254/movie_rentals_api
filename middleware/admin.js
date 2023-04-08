import config from 'config';

export default function (req, res, next) {
  if (!config.get('requiresAuth')) return next();
  if (!req.user.isAdmin) return res.status(403).send('Forbidden.');
  return next();
}
