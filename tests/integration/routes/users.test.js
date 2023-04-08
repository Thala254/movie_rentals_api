/* eslint-disable jest/no-hooks */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import request from 'supertest';
import { disconnect } from 'mongoose';
import { hash, genSalt } from 'bcrypt';
import { User } from '../../../models/user';
import app from '../../../app';

let server;

describe('/api/users', () => {
  let name;
  let email;
  let password;

  beforeEach(() => { server = app; });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(() => {
    disconnect();
  });

  describe('POST /', () => {
    const exec = async () => request(server)
      .post('/api/users')
      .send({
        name,
        email,
        password,
        isAdmin: false,
      });

    beforeEach(() => {
      name = 'user1';
      email = 'test@mail.com';
      password = 'abcd1234';
    });

    it('returns a status of 400 if name is missing', async () => {
      name = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if name is less than 2 characters', async () => {
      name = 'a';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if name is more than 255 characters', async () => {
      name = new Array(270).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a status of 400 if missing email', async () => {
      email = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a status of 400 if email has less than 5 characters', async () => {
      email = 'te@t';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a status of 400 if email has more than 255 characters', async () => {
      email = `${new Array(300).join('a')}@test.com`;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a status of 400 if email is invalid', async () => {
      email = 'test@mail';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a status of 400 if missing password', async () => {
      password = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a status of 400 if password has less than 5 characters', async () => {
      password = 'pass';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a status of 400 if password has more than 1024 characters', async () => {
      password = `${new Array(1050).join('a')}@test.com`;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save the user if it is valid', async () => {
      await exec();
      const user = await User.findOne({ name, email });
      expect(user).not.toBeNull();
    });

    it('should return the user if it is valid', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', name);
    });

    it('should return a 400 status if the user exists already', async () => {
      await new User({ email, name, password }).save();
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });

  describe('GET /me', () => {
    let name;
    let email;
    let password;
    let token;

    const exec = async () => request(server)
      .get('/api/users/me')
      .set('x-auth-token', token);

    beforeEach(async () => {
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

    it('returns currently logged in user if token is valid', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', name);
      expect(res.body).toHaveProperty('email', email);
      expect(res.body).toHaveProperty('_id');
    });
  });
});
