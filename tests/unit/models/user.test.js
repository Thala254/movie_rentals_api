/* eslint-disable jest/prefer-expect-assertions */
import { verify } from 'jsonwebtoken';
import config from 'config';
import { Types } from 'mongoose';
import { User } from '../../../models/user';

describe('user.generateAuthToken', () => {
  it('should return a valid JWT', () => {
    const payload = {
      _id: Types.ObjectId().toHexString(),
      isAdmin: false,
      name: 'Mark Miller',
      email: 'mm@test.com',
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    const decoded = verify(token, config.get('jwtPrivateKey'));
    expect(decoded).toMatchObject(payload);
  });
});
