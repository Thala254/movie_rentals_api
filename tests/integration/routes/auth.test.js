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

describe('POST /api/auth', () => {
  let email;
  let password;

  const exec = async () => request(server)
    .post('/api/auth')
    .send({ email, password });

  beforeEach(async () => {
    server = app;
    email = 'test@test.com';
    password = 'abcd1234';
    await new User({
      email,
      password: await hash(password, await genSalt(10)),
      name: 'testUser',
    }).save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    // await server.close();
  });

  afterAll(() => {
    disconnect();
  });

  it('returns a status of 400 if missing email', async () => {
    email = '';
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
    email = 'testmail';
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('returns a status of 400 if email does not exist in the database', async () => {
    email = 'test1@mail.com';
    const res = await exec();
    expect(res.status).toBe(400);
    expect(res.text).toStrictEqual('Invalid email.');
  });

  it('returns a status of 400 if missing password', async () => {
    password = '';
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('returns a status of 400 if password has less than 5 characters', async () => {
    password = 'pass';
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('returns a status of 400 if password has more than 255 characters', async () => {
    password = new Array(300).join('a');
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('returns a status of 400 if password is invalid', async () => {
    password = 'password';
    const res = await exec();
    expect(res.status).toBe(400);
    expect(res.text).toStrictEqual('Invalid password');
  });

  it('returns auth token if password and email are valid', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
    expect(res.text).not.toBeNull();
  });
});
