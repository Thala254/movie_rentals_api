import moment from 'moment';
import { Movie, validateMovie } from '../models/movie.js';
import { Genre } from '../models/genre.js';

export const getAll = async (req, res) => {
  const movies = await Movie.find().select('-__v').sort('name');
  res.send(movies);
};

export const create = async (req, res) => {
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(`Invalid genre: ${error.details[0].message}`);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const {
    title,
    inStock,
    dailyRentalRate,
    like,
  } = req.body;

  const movie = new Movie({
    title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    inStock,
    dailyRentalRate,
    publishDate: moment().toJSON(),
    like,
  });
  await movie.save();
  return res.send(movie);
};

export const getOne = async (req, res) => {
  const movie = await Movie.findById(req.params.id).select('-__v');
  if (!movie) return res.status(404).send('Not found');
  return res.send(movie);
};

export const update = async (req, res) => {
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const {
    title,
    inStock,
    dailyRentalRate,
    like,
  } = req.body;

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title,
      genre: {
        _id: genre._id,
        name: genre.name,
      },
      inStock,
      dailyRentalRate,
      like,
    },
    { new: true },
  ).select('-__v');

  if (!movie) return res.status(404).send('Not found');

  return res.send(movie);
};

export const remove = async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id).select('-__v');
  if (!movie) return res.status(404).send('Not found');
  return res.send(movie);
};
