/* eslint-disable jest/no-hooks */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/prefer-expect-assertions */
import request from 'supertest';
import { Types, disconnect } from 'mongoose';
import { Customer } from '../../../models/customer';
import { User } from '../../../models/user';
import app from '../../../app';

let server;

describe('/api/customers', () => {
  beforeEach(() => { server = app; });

  afterEach(async () => {
    await Customer.deleteMany({});
  });

  afterAll(() => {
    disconnect();
  });

  describe('GET /', () => {
    it('returns all customers', async () => {
      const token = new User({ isAdmin: true }).generateAuthToken();
      const customers = [
        {
          name: 'customer1',
          telephone: '+1257896',
          isGold: false,
        },
        {
          name: 'customer2',
          telephone: '+45879962',
          isGold: true,
        },
      ];
      await Customer.insertMany(customers);
      const res = await request(server).get('/api/customers').set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(res.body).not.toBeNull();
      expect(res.body.some((c) => c.name === 'customer1')).toBeTruthy();
      expect(res.body.some((c) => c.name === 'customer2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let token;
    let name;
    let telephone;
    let id;

    const exec = async () => request(server)
      .get(`/api/customers/${id}`)
      .set('x-auth-token', token);

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = 'customer1';
      telephone = '123456789';
      const customer = new Customer({ name, telephone });
      await customer.save();
      id = customer._id;
    });

    it('returns a 404 status if customer id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('returns a customer if a valid customer id is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', name);
    });
  });

  describe('POST /', () => {
    let token;
    let name;
    let telephone;

    const exec = async () => request(server)
      .post('/api/customers')
      .set('x-auth-token', token)
      .send({ name, telephone, isGold: false });

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = 'customer1';
      telephone = '123456789';
    });

    it('returns a 400 status if customer name is less than 5 characters', async () => {
      name = 'abcd';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if customer name is more than 50 characters', async () => {
      name = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save the customer if it is valid', async () => {
      await exec();
      const customer = await Customer.find({ name });
      expect(customer).not.toBeNull();
    });

    it('should return the customer if it is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', name);
    });

    it('should return a 400 status if the customer exists already', async () => {
      await new Customer({ name, telephone }).save();
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id', () => {
    let token;
    let name;
    let telephone;
    let id;

    const exec = async () => request(server)
      .put(`/api/customers/${id}`)
      .set('x-auth-token', token)
      .send({ name, telephone, isGold: false });

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = 'customer1';
      telephone = '123456';
      const customer = await new Customer({ name, telephone, isGold: true }).save();
      name = 'customer2';
      telephone = '456789';
      id = customer._id;
    });

    it('returns a 404 status if customer id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('returns a 400 status if new customer name has less than 5 characters', async () => {
      name = 'abcd';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('returns a 400 status if new customer name has more than 50 characters', async () => {
      name = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should update the customer if it is valid', async () => {
      await exec();
      const customer = await Customer.findOne({ name: 'customer2', telephone: '456789' });
      expect(customer).not.toBeNull();
    });

    it('returns a customer if a valid customer id and body is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', name);
      expect(res.body).toHaveProperty('telephone', telephone);
    });
  });

  describe('DELETE /:id', () => {
    let token;
    const name = 'test-customer';
    let id;

    const exec = async () => request(server)
      .delete(`/api/customers/${id}`)
      .set('x-auth-token', token);

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      const customer = new Customer({ name, telephone: '123456789' });
      await customer.save();
      id = customer._id;
    });

    it('returns a 404 status if customer id does not exist', async () => {
      id = Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should delete the customer if valid id is passed', async () => {
      await exec();
      const customer = await Customer.findOne({ name: 'customer1' });
      expect(customer).toBeNull();
    });

    it('returns a customer if a valid id is passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', name);
    });
  });
});
