import Joi from 'joi';
import config from 'config';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const { model, Schema } = mongoose;
const { sign } = jwt;

export const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAuthToken = function() {
  return sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    config.get('jwtPrivateKey'),
    { expiresIn: '24h' },
  );
};

export const User = model('User', userSchema);

export const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(255)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(1024)
      .required(),
    isAdmin: Joi.boolean(),
  });
  return schema.validate(user);
};
