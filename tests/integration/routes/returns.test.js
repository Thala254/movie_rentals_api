/* eslint-disable jest/no-hooks */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import moment from 'moment';
import request from 'supertest';
import { Types, disconnect } from 'mongoose';
import { Rental } from '../../../models/rental';
import { Movie } from '../../../models/movie';
import { User } from '../../../models/user';
import app from '../../../app';

describe('/api/returns', () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let movie;
  let token;

  const exec = () => request(server)
    .post('/api/returns')
    .set('x-auth-token', token)
    .send({ customerId, movieId });

  beforeEach(async () => {
    server = app;
    customerId = Types.ObjectId();
    movieId = Types.ObjectId();
    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: '12345',
      dailyRentalRate: 2,
      genre: { name: '12345' },
      inStock: 10,
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        telephone: '12345',
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2,
        quantity: 2,
      },
      dateOut: new Date(),
    });
    await rental.save();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  afterAll(() => {
    disconnect();
  });

  it('should return 400 if customerId is not provided', async () => {
    customerId = '';
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 400 if movieId is not provided', async () => {
    movieId = '';
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental found for the customer/movie', async () => {
    await Rental.deleteMany({});
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it('should return 400 if return is already processed', async () => {
    rental.dateReturned = new Date();
    rental.movie.quantity = 0;
    await rental.save();
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 200 if we have a valid request', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it('should set the returnDate if input is valid', async () => {
    await exec();
    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should set the rentalFee if input is valid', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate();
    await rental.save();
    await exec();
    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(14);
  });

  it('should increase the movie stock if input is valid', async () => {
    await exec();
    const movieInDb = await Movie.findById(movieId);
    expect(movieInDb.inStock).toBe(movie.inStock + 1);
  });

  it('should return the rental if input is valid', async () => {
    const res = await exec();
    await Rental.findById(rental._id);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toStrictEqual(expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie']));
    expect(JSON.parse(res.text)).not.toBeNull();
  });
});
