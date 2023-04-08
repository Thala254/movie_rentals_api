/* eslint-disable jest/no-hooks */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import request from 'supertest';
import { disconnect } from 'mongoose';
import { hash, genSalt } from 'bcrypt';
import { User } from '../../../models/user';
import app from '../../../app';

let name;
let email;
let password;
let token;
let server;

describe('auth middleware', () => {
  const exec = async () => request(server)
    .get('/api/users/me')
    .set('x-auth-token', token);

  beforeEach(async () => {
    server = app;
    name = 'test user';
    email = 'test@mail.com';
    password = 'abcd1234';
    const user = await new User({
      name,
      email,
      password: await hash(password, await genSalt(10)),
    }).save();
    token = user.generateAuthToken();
  });

  afterEach(async () => {
    await User.deleteMany({});
    // await server.close();
  });

  afterAll(() => disconnect());

  it('returns a 401 status if user is not logged in / no token', async () => {
    token = '';
    const res = await exec();
    expect(res.status).toBe(401);
    expect(res.text).toStrictEqual('Access denied. No token provided');
  });

  it('returns a 400 status if an invalid token is passed', async () => {
    token = 'dfghjoiughkjh.fghjkjhdfguyfgh.uytrtyupojhgjhg';
    const res = await exec();
    expect(res.status).toBe(400);
    expect(res.text).toStrictEqual('Invalid token');
  });

  it('returns currently logged in user if token is valid', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', name);
    expect(res.body).toHaveProperty('email', email);
    expect(res.body).toHaveProperty('_id');
  });
});
