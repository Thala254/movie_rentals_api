/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/prefer-expect-assertions */
import { Types } from 'mongoose';
import { User } from '../../../models/user';
import auth from '../../../middleware/auth';

describe('auth middleware', () => {
  it('Succeeds to populate req.user with payload of a valid JWT', () => {
    const user = {
      _id: Types.ObjectId().toHexString(),
      isAdmin: true,
      name: 'John Doe',
      email: 'johndoe@test.com',
    };

    const token = new User(user).generateAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toMatchObject(user);
  });
});
