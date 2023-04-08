/* eslint-disable no-await-in-loop */
import mongoose from 'mongoose';
import config from 'config';
import { Genre } from './models/genre.js';
import { Movie } from './models/movie.js';
import { logger } from './startup/logging.js';

const { connect, disconnect } = mongoose;

const data = [
  {
    name: 'Comedy',
    movies: [
      { title: 'Airplane', inStock: 5, dailyRentalRate: 2.5 },
      { title: 'The Hangover', inStock: 10, dailyRentalRate: 2.2 },
      { title: 'Wedding Crashers', inStock: 15, dailyRentalRate: 1.2 },
    ],
  },
  {
    name: 'Action',
    movies: [
      { title: 'Die Hard', inStock: 5, dailyRentalRate: 3.4 },
      { title: 'Terminator', inStock: 10, dailyRentalRate: 2.1 },
      { title: 'The Avengers', inStock: 15, dailyRentalRate: 4.5 },
    ],
  },
  {
    name: 'Romance',
    movies: [
      { title: 'The Notebook', inStock: 5, dailyRentalRate: 2.8 },
      { title: 'When Harry Met Sally', inStock: 10, dailyRentalRate: 3.7 },
      { title: 'Pretty Woman', inStock: 15, dailyRentalRate: 1.5 },
    ],
  },
  {
    name: 'Thriller',
    movies: [
      { title: 'The Sixth Sense', inStock: 5, dailyRentalRate: 6.4 },
      { title: 'Gone Girl', inStock: 10, dailyRentalRate: 1.4 },
      { title: 'The Others', inStock: 15, dailyRentalRate: 3.1 },
    ],
  },
];

const seed = async () => {
  await connect(config.get('db'), { useNewUrlParser: true, useUnifiedTopology: true });

  await Movie.deleteMany({});
  await Genre.deleteMany({});

  for (const genre of data) {
    const { _id: genreId } = await new Genre({ name: genre.name }).save();
    const movies = genre.movies.map((movie) => ({
      ...movie,
      genre: { _id: genreId, name: genre.name },
    }));
    await Movie.insertMany(movies);
  }

  disconnect();
  logger.info('Done!');
};

seed();
