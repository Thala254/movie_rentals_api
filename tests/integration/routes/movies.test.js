/* eslint-disable jest/no-hooks */
/* eslint-disable jest/no-disabled-tests */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import request from 'supertest';
import { Types, disconnect } from 'mongoose';
import { Movie } from '../../../models/movie';
import { Genre } from '../../../models/genre';
import { User } from '../../../models/user';
import app from '../../../app';

let server;

describe('/api/movies', () => {
  beforeEach(() => { server = app; });

  afterEach(async () => {
    await Movie.deleteMany({});
  });

  afterAll(() => {
    disconnect();
  });

  describe('GET /', () => {
    it('returns all movies', async () => {
      const movies = [
        {
          title: 'movie1',
          inStock: 2,
          dailyRentalRate: 2.5,
          genre: {
            name: 'genre1',
          },
        },
        {
          title: 'movie2',
          inStock: 3,
          dailyRentalRate: 1.5,
          genre: {
            name: 'genre2',
          },
        },
      ];
      await Movie.insertMany(movies);
      const res = await request(server).get('/api/movies');
      expect(res.status).toBe(200);
      expect(res.body).not.toBeNull();
      expect(JSON.parse(res.text).some((m) => m.title === 'movie1')).toBeTruthy();
      expect(JSON.parse(res.text).some((m) => m.title === 'movie2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let token;
    let title;
    let id;

    const exec = async () => request(server)
      .get(`/api/movies/${id}`)
      .set('x-auth-token', token);

    beforeEach(async () => {
      token = new User().generateAuthToken();
      title = 'movie1';
      const movie = new Movie({
        title,
        inStock: 2,
        dailyRentalRate: 2.5,
        genre: {
          name: 'genre2',
        },
      });
      await movie.save();
      id = movie._id;
    });

    it('returns a 404 status if movie id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('returns a movie if a valid movie id is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', title);
    });
  });

  describe('POST /', () => {
    let token;
    let title;
    let inStock;
    let dailyRentalRate;
    let genreId;

    const exec = async () => request(server)
      .post('/api/movies')
      .set('x-auth-token', token)
      .send({
        title,
        inStock,
        dailyRentalRate,
        genreId,
        like: false,
      });

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      title = 'movie1';
      inStock = 2;
      dailyRentalRate = 1.5;
      const genre = await new Genre({ name: 'movieGenre' }).save();
      genreId = genre._id;
    });

    it('returns a 400 status if title is less than 5 characters', async () => {
      title = 'abcd';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if title is more than 255 characters', async () => {
      title = new Array(270).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if inStock is less than 0', async () => {
      inStock = -5;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if inStock is more than 255', async () => {
      inStock = 300;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if dailyRentalRate is less than 0', async () => {
      dailyRentalRate = -2;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if dailyRentalRate is more than 255', async () => {
      dailyRentalRate = 300;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if dailyRentalRate is missing', async () => {
      dailyRentalRate = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if inStock is missing', async () => {
      inStock = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if title is missing', async () => {
      title = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save the movie if it is valid', async () => {
      await exec();
      const movie = await Movie.findOne({ title });
      expect(movie).not.toBeNull();
    });

    it('should return the movie if it is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', title);
    });

    it('should return a 400 status if the genre does not exist', async () => {
      genreId = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id', () => {
    let token;
    let title;
    let inStock;
    let dailyRentalRate;
    let genreId;
    let id;

    const exec = async () => request(server)
      .put(`/api/movies/${id}`)
      .set('x-auth-token', token)
      .send({
        title,
        inStock,
        dailyRentalRate,
        genreId,
        like: false,
      });

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      title = 'movie1';
      inStock = 2;
      dailyRentalRate = 1.5;
      const genre = await new Genre({ name: 'movieGenre' }).save();
      genreId = genre._id;
      const movie = await new Movie({
        title,
        inStock,
        dailyRentalRate,
        genre,
      }).save();
      id = movie._id;
    });

    it('returns a 404 status if movie id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('returns a 400 status if title less than 5 characters', async () => {
      title = 'abcd';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if title more than 255 characters', async () => {
      title = new Array(300).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return a 400 status if the genre does not exist', async () => {
      genreId = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should update the movie if it is valid', async () => {
      title = 'Coming To America';
      dailyRentalRate = 4.5;
      await exec();
      const movie = await Movie.find({ title });
      expect(movie).not.toBeNull();
    });

    it('returns a movie if a valid id is passed', async () => {
      title = 'Coming To America';
      dailyRentalRate = 4.5;
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', title);
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let title;
    let id;

    const exec = async () => request(server)
      .delete(`/api/movies/${id}`)
      .set('x-auth-token', token);

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      title = 'movie1';
      const movie = await new Movie({
        title,
        inStock: 3,
        dailyRentalRate: 3.2,
        genre: { name: 'movieGenre' },
      }).save();
      id = movie._id;
    });

    it('returns a 404 status if movie id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should delete the movie if valid id is passed', async () => {
      await exec();
      const genre = await Movie.findOne({ title });
      expect(genre).toBeNull();
    });

    it('returns a movie if a valid movieId is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', title);
    });
  });
});
