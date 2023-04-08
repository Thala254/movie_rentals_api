import { Genre, validateGenre } from '../models/genre.js';

export const getAll = async (req, res) => {
  const genres = await Genre.find().select('-__v').sort('name');
  return res.send(genres);
};

export const create = async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(`Invalid genre: ${error.details[0].message}`);

  let genre = await Genre.findOne({ name: req.body.name });
  if (genre) return res.status(400).send('This genre exists already');

  genre = new Genre({
    name: req.body.name,
  });
  await genre.save();
  return res.send(genre);
};

export const getOne = async (req, res) => {
  const genre = await Genre.findById(req.params.id).select('-__v');
  if (!genre) return res.status(404).send('Not found');
  return res.send(genre);
};

export const update = async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true },
  ).select('-__v');

  if (!genre) return res.status(404).send('Not found');
  return res.send(genre);
};

export const remove = async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id).select('-__v');
  if (!genre) return res.status(404).send('Not found');
  return res.send(genre);
};
