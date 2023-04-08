import Fawn from 'fawn';
import mongoose from 'mongoose';
import { Rental, validateRental } from '../models/rental.js';
import { Customer } from '../models/customer.js';
import { Movie } from '../models/movie.js';

Fawn.init(mongoose);

export const getAll = async (req, res) => {
  const rentals = await Rental.find().select('-__v').sort('-dateOut');
  return res.send(rentals);
};

export const create = async (req, res) => {
  const { error } = validateRental(req.body);
  if (error) return res.status(400).send(`Error: ${error.details[0].message}`);

  const { customerId, movieId } = req.body;
  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(400).send('Invalid Customer.');

  const movie = await Movie.findById(movieId);
  if (!movie) return res.status(400).send('Invalid movie.');

  if (movie.inStock === 0) return res.status(400).send('Movie out of stock');

  let rental = await Rental.lookup(customerId, movieId);
  if (rental) {
    try {
      await new Fawn.Task()
        .update(
          'rentals',
          { _id: rental._id },
          {
            $set: { dateOut: new Date() },
            $inc: { 'movie.quantity': 1 },
          },
        )
        .update(
          'movies',
          { _id: movie._id },
          { $inc: { inStock: -1 } },
        )
        .run();
      const updatedRental = await Rental.findById(rental._id);
      return res.send(updatedRental);
    } catch (err) {
      return res.status(500).send(`Something failed: ${err}`);
    }
  }

  rental = new Rental({
    customer: {
      ...customer,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
      quantity: 1,
    },
  });

  try {
    await new Fawn.Task()
      .save('rentals', rental)
      .update(
        'movies',
        { _id: movie._id },
        { $inc: { inStock: -1 } },
      )
      .run();
    return res.send(rental);
  } catch (err) {
    return res.status(500).send(`Something failed: ${err}`);
  }
};

export const getOne = async (req, res) => {
  const rental = await Rental.findById(req.params.id).select('-__v');
  if (!rental) return res.status(404).send('Not found');
  return res.send(rental);
};

export const remove = async (req, res) => {
  const rental = await Rental.findById(req.params.id).select('-__v');
  if (!rental) return res.status(404).send('Not found');
  await Rental.deleteOne({ _id: rental._id });
  return res.send(rental);
};
