import express from 'express';
import router from '../routes/index.js';
import error from '../middleware/error.js';
import { morganMiddleware } from './logging.js';

const {
  users,
  auth,
  movies,
  genres,
  customers,
  rentals,
  returns,
} = router;

export default function (app) {
  app.use(express.json());
  app.use(morganMiddleware);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/movies', movies);
  app.use('/api/genres', genres);
  app.use('/api/customers', customers);
  app.use('/api/rentals', rentals);
  app.use('/api/returns', returns);
  app.use(error);
}
