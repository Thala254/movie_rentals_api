/* eslint-disable jest/no-hooks */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import request from 'supertest';
import { Types, disconnect } from 'mongoose';
import { Genre } from '../../../models/genre';
import { User } from '../../../models/user';
import app from '../../../app';

let server;

describe('/api/genres', () => {
  beforeEach(() => { server = app; });

  afterEach(async () => {
    await Genre.deleteMany({});
  });

  afterAll(() => {
    disconnect();
  });

  describe('GET /', () => {
    it('returns all genres', async () => {
      const genres = [
        { name: 'genre1' },
        { name: 'genre2' },
      ];
      await Genre.insertMany(genres);
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body).not.toBeNull();
      expect(res.body.some((g) => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some((g) => g.name === 'genre2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let token;
    let name;
    let id;

    const exec = async () => request(server)
      .get(`/api/genres/${id}`)
      .set('x-auth-token', token);

    beforeEach(async () => {
      token = new User().generateAuthToken();
      name = 'genre1';
      const genre = new Genre({ name });
      await genre.save();
      id = genre._id;
    });

    it('returns a 404 status if genre id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('returns a genre if a valid genre id is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', name);
    });
  });

  describe('POST /', () => {
    let token;
    let name;

    const exec = async () => request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name });

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = 'genre1';
    });

    it('returns a 400 status if genre is less than 5 characters', async () => {
      name = 'abcd';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if genre is more than 50 characters', async () => {
      name = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      await exec();
      const genre = await Genre.find({ name });
      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', name);
    });

    it('should return a 400 status if the genre exists already', async () => {
      await new Genre({ name }).save();
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id', () => {
    let token;
    let name;
    let id;

    const exec = async () => request(server)
      .put(`/api/genres/${id}`)
      .set('x-auth-token', token)
      .send({ name });

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = 'genre1';
      const genre = await new Genre({ name }).save();
      name = 'genre2';
      id = genre._id;
    });

    it('returns a 404 status if genre id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('returns a 400 status if new genre name has less than 5 characters', async () => {
      name = 'abcd';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if new genre name has more than 50 characters', async () => {
      name = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should update the genre if it is valid', async () => {
      await exec();
      const genre = await Genre.find({ name: 'genre2' });
      expect(genre).not.toBeNull();
    });

    it('returns a genre if a valid genre is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', name);
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let name;
    let id;

    const exec = async () => request(server)
      .delete(`/api/genres/${id}`)
      .set('x-auth-token', token);

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = 'genre1';
      const genre = new Genre({ name });
      await genre.save();
      id = genre._id;
    });

    it('returns a 404 status if genre id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should delete the genre if valid id is passed', async () => {
      await exec();
      const genre = await Genre.findOne({ name: 'genre1' });
      expect(genre).toBeNull();
    });

    it('returns a genre if a valid genre is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', name);
    });
  });
});
