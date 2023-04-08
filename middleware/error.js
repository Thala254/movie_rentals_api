import { logger } from '../startup/logging.js';

export default function (err, req, res, next) {
  logger.error(err.message, err);
  return res.status(500).send(`Server Error: ${err.message}`);
}
