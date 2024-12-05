const Joi = require('joi')

exports.register = Joi.object().keys({
  username: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .trim()
    .min(8)
    .max(100)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*\\d).{5,}$'))
    .required(),
  profile_picture: Joi.string().allow(null).optional(),
})

exports.updateUsernameEmail = Joi.object()
  .keys({
    username: Joi.string().trim().min(3).optional().allow(null),
    email: Joi.string().trim().email().optional().allow(null),
  })
  .or('username', 'email')
