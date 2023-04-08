import Joi from 'joi';
import mongoose from 'mongoose';

const { model, Schema } = mongoose;

export const genreSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
  },
});

export const Genre = model('Genre', genreSchema);

export const validateGenre = (genre) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
  });
  return schema.validate(genre);
};
