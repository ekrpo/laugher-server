import Joi from "joi"


export const JokeSchema = Joi.object({
  description: Joi.string().allow('').optional(),
  isPublic: Joi.boolean().default(true).optional(),
  battle: Joi.any().default(null).optional(),
  file: Joi.object().allow(null).optional()
}).custom((value, helpers) => {
  if (!value.description && !value.file) {
    return helpers.error('Either description, photo or audio must be filled');
  }
  return value;
}).error(new Error('Either description or photo must be filled, and both can be filled if present'));


