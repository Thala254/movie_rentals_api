import Joi from 'joi';
import mongoose from 'mongoose';

const { model, Schema } = mongoose;

export const customerSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
  telephone: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
    unique: true,
  },
});

export const Customer = model('Customer', customerSchema);

export const validateCustomer = (customer) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    telephone: Joi.string().min(5).max(50).required(),
    isGold: Joi.boolean(),
  });
  return schema.validate(customer);
};
