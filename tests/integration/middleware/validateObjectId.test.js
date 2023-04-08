/* eslint-disable jest/no-hooks */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import request from 'supertest';
import { disconnect } from 'mongoose';
import { Genre } from '../../../models/genre';
import { User } from '../../../models/user';
import app from '../../../app';

let server;

describe('validateObjectId middleware', () => {
  let token;
  let id;

  const exec = async () => request(server)
    .get(`/api/genres/${id}`)
    .set('x-auth-token', token);

  beforeEach(async () => {
    server = app;
    token = new User().generateAuthToken();
    const genre = new Genre({ name: 'genre8' });
    await genre.save();
    id = genre._id;
  });

  afterEach(async () => {
    await Genre.deleteMany({});
    // await server.close();
  });

  afterAll(() => {
    disconnect();
  });

  it('returns a 404 status if an invalid id is passed', async () => {
    id = 1;
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it('returns a 200 status if a valid id is passed', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});
