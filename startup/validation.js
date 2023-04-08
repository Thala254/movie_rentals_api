import Joi from 'joi';
import objectId from 'joi-objectid';

export default function () {
  Joi.objectId = objectId(Joi);
}
