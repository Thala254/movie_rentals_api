/* eslint-disable jest/no-hooks */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import request from 'supertest';
import { disconnect } from 'mongoose';
import { User } from '../../../models/user';
import { Customer } from '../../../models/customer';
import app from '../../../app';

let server;

describe('admin middleware', () => {
  let token;

  beforeEach(async () => {
    server = app;
    const customer = new Customer({
      name: 'customer1',
      telephone: '+1257896',
      isGold: false,
    });
    await customer.save();
    token = new User({ isAdmin: true }).generateAuthToken();
  });

  afterEach(async () => {
    await Customer.deleteMany({});
    // await server.close();
  });

  afterAll(() => {
    disconnect();
  });

  it('returns a 200 status if user is admin', async () => {
    const res = await request(server).get('/api/customers').set('x-auth-token', token);
    expect(res.status).toBe(200);
    expect(res.body).not.toBeNull();
    expect(res.body.some((c) => c.name === 'customer1')).toBeTruthy();
  });

  it('returns a 403 status if user is not admin', async () => {
    token = new User({}).generateAuthToken();
    const res = await request(server).get('/api/customers').set('x-auth-token', token);
    expect(res.status).toBe(403);
  });
});
