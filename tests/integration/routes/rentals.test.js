/* eslint-disable jest/no-hooks */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import request from 'supertest';
import { Types, disconnect } from 'mongoose';
import { Rental } from '../../../models/rental';
import { User } from '../../../models/user';
import { Customer } from '../../../models/customer';
import { Movie } from '../../../models/movie';
import app from '../../../app';

let server;

describe('/api/rentals', () => {
  beforeEach(() => { server = app; });

  afterEach(async () => {
    await Rental.deleteMany({});
  });

  afterAll(() => {
    disconnect();
  });

  describe('GET /', () => {
    let token;

    beforeEach(async () => {
      token = await new User({ isAdmin: true }).generateAuthToken();
    });

    it('returns all rentals', async () => {
      const rentals = [
        {
          customer: {
            name: 'customer1',
            isGold: false,
            telephone: '1265478',
          },
          movie: {
            title: 'movie1',
            dailyRentalRate: 1.6,
            quantity: 2,
          },
          dateOut: new Date(),
        },
        {
          customer: {
            name: 'customer2',
            isGold: false,
            telephone: '456789',
          },
          movie: {
            title: 'movie2',
            dailyRentalRate: 2.6,
            quantity: 10,
          },
          dateOut: new Date(),
        },
      ];
      await Rental.insertMany(rentals);
      const res = await request(server)
        .get('/api/rentals')
        .set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(res.body).not.toBeNull();
      expect(res.body.some((r) => r.customer.name === 'customer1')).toBeTruthy();
      expect(res.body.some((r) => r.movie.title === 'movie2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let token;
    let id;

    const exec = async () => request(server)
      .get(`/api/rentals/${id}`)
      .set('x-auth-token', token);

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      const rental = new Rental({
        customer: {
          name: 'customer3',
          isGold: true,
          telephone: '4537896',
        },
        movie: {
          title: 'movie3',
          dailyRentalRate: 1.8,
          quantity: 15,
        },
        dateOut: new Date(),
      });
      await rental.save();
      id = rental._id;
    });

    it('returns a 404 status if rental id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('returns a rental if a valid rental id is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('customer');
    });
  });

  describe('POST /', () => {
    let token;
    let customerId;
    let movieId;

    let exec = async () => request(server)
      .post('/api/rentals')
      .set('x-auth-token', token)
      .send({ customerId, movieId });

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      const customer = new Customer({
        name: 'customer4',
        telephone: '1245789632',
      });
      await customer.save();
      const movie = new Movie({
        title: 'movie4',
        inStock: 4,
        dailyRentalRate: 4.2,
        genre: { name: 'genre4' },
      });
      await movie.save();
      customerId = customer._id;
      movieId = movie._id;
    });

    afterEach(async () => {
      await Customer.deleteMany({});
      await Movie.deleteMany({});
    });

    it('returns a 400 status if an invalid request body is sent', async () => {
      customerId = 'asdfg-sdfghj-sdfgh-trecv';
      movieId = 'dfghj-hg-dfg-hgf';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if customerId does not exist', async () => {
      customerId = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toStrictEqual('Invalid Customer.');
    });

    it('returns a 400 status if movieId does not exist', async () => {
      movieId = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toStrictEqual('Invalid movie.');
    });

    it('returns a 400 status if movie stock is 0', async () => {
      const movie2 = new Movie({
        title: 'movie5',
        inStock: 0,
        dailyRentalRate: 2.2,
        genre: { name: 'genre5' },
      });
      await movie2.save();
      movieId = movie2._id;
      const res = await exec();
      expect(res.status).toBe(400);
      expect(res.text).toStrictEqual('Movie out of stock');
    });

    it('should save the rental if it is valid', async () => {
      await exec();
      const rental = await Rental.findOne({ 'customer.telephone': '1245789632' });
      expect(rental).not.toBeNull();
    });

    it('should return the rental if it is valid', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('dateOut');
    });

    it('should return an updated rental if the rental exists already', async () => {
      await new Rental({
        customer: {
          _id: customerId,
          name: 'customer4',
          telephone: '1245789632',
        },
        movie: {
          _id: movieId,
          title: 'movie4',
          quantity: 2,
          dailyRentalRate: 4.2,
        },
        dateOut: new Date(),
      }).save();
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('dateOut');
    });
  });
});
