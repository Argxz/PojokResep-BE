const Joi = require('joi')

exports.create = Joi.object().keys({
  user_id: Joi.number().integer().required(),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  ingredients: Joi.string().trim().required(),
  instructions: Joi.string().trim().required(),
  cooking_time: Joi.string().trim().required(),
  serving_size: Joi.string().trim().required(),
  difficulty_level: Joi.string()
    .valid('mudah', 'menengah', 'sulit', 'ahli')
    .required(), // Misalnya, jika ada level kesulitan tertentu
  category_id: Joi.number().integer().required(),
  image_url: Joi.string().uri().allow(null), // Mengizinkan null jika tidak ada URL gambar
})

exports.update = Joi.object()
  .keys({
    title: Joi.string().trim().min(3).max(255).optional(),
    description: Joi.string().trim().min(10).optional(),
    ingredients: Joi.string().trim().min(5).optional(),
    instructions: Joi.string().trim().min(10).optional(),
    cooking_time: Joi.string().trim().optional(),
    serving_size: Joi.string().trim().optional(),
    difficulty_level: Joi.string()
      .valid('mudah', 'menengah', 'sulit', 'ahli')
      .optional(),
    category_id: Joi.number().integer().positive().optional(),
    image_url: Joi.string().uri().allow(null).optional(),
  })
  .min(1) // Pastikan setidaknya satu field diupdate

exports.deleteSchema = Joi.object().keys({
  id: Joi.number().integer().positive().required(),
})
