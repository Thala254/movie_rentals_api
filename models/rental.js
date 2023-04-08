import Joi from 'joi';
import moment from 'moment';
import mongoose from 'mongoose';
import { customerSchema } from './customer.js';

const { model, Schema } = mongoose;

export const rentalSchema = new Schema({
  customer: {
    type: customerSchema,
    required: true,
  },
  movie: {
    type: new Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
      quantity: {
        type: Number,
        min: 0,
        max: 255,
        required: true,
      },
    }),
    required: true,
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dateReturned: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0,
  },
});

rentalSchema.statics.lookup = function (customerId, movieId) {
  return this.findOne({ 'customer._id': customerId, 'movie._id': movieId });
};

rentalSchema.methods.return = function () {
  this.movie.quantity -= 1;
  this.dateReturned = new Date();
  const rentalDays = moment().diff(this.dateOut, 'days');
  this.rentalFee = Math.round(rentalDays * this.movie.dailyRentalRate);
};

export const Rental = model('Rental', rentalSchema);

export const validateRental = (rental) => {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });
  return schema.validate(rental);
};
