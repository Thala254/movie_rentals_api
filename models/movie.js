import Joi from 'joi';
import mongoose from 'mongoose';
import { genreSchema } from './genre.js';

const { model, Schema } = mongoose;

export const movieSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255,
  },
  genre: {
    type: genreSchema,
    required: true,
  },
  inStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  like: {
    type: Boolean,
    default: false,
  },
});

export const Movie = model('Movie', movieSchema);

export const validateMovie = (movie) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    genreId: Joi.objectId().required(),
    inStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required(),
    like: Joi.boolean(),
  });
  return schema.validate(movie);
};
