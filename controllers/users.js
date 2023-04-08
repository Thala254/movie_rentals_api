import { hash, genSalt } from 'bcrypt';
import _ from 'lodash';
import { User, validateUser } from '../models/user.js';

export const getUser = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(_.pick(user, ['_id', 'name', 'email']));
};

export const registerUser = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered');

  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await genSalt(10);
  user.password = await hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  return res
    .header('x-auth-token', token)
    .header('access-control-expose-headers', 'x-auth-token')
    .send(_.pick(user, ['_id', 'name', 'email']));
};
