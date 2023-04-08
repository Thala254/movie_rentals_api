import Joi from 'joi';
import { compare } from 'bcrypt';
import { User } from '../models/user.js';

const validate = (req) => {
  const schema = Joi.object({
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required(),
  });
  return schema.validate(req);
};

const authController = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(`Error: ${error.details[0].message}`);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email.');

  const validPassword = await compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid password');

  const token = user.generateAuthToken();
  return res.send(token);
};

export default authController;
