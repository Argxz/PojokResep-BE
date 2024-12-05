const Joi = require('joi')

exports.create = Joi.object().keys({
  user_id: Joi.number().integer().required(),
  title: Joi.string().trim().min(3).max(255).required(), // Tambahkan batasan panjang
  description: Joi.string().trim().min(10).max(500).required(), // Tambahkan batasan panjang
  ingredients: Joi.string().trim().min(10).required(), // Minimal panjang ingredients
  instructions: Joi.string().trim().min(10).required(), // Minimal panjang instructions
  cooking_time: Joi.number().integer().min(1).required(), // Ubah ke number
  serving_size: Joi.number().integer().min(1).required(), // Ubah ke number
  difficulty_level: Joi.string()
    .valid('Easy', 'Medium', 'Hard') // Sesuaikan dengan opsi di frontend
    .required(),
  category_id: Joi.number().integer().required(),
  image_url: Joi.string().allow(null), // Opsional
})

exports.update = Joi.object()
  .keys({
    user_id: Joi.string().optional(),
    title: Joi.string().trim().min(3).max(255).optional().allow(''),
    description: Joi.string().trim().min(10).max(500).optional().allow(''),
    ingredients: Joi.string().trim().min(5).optional().allow(''),
    instructions: Joi.string().trim().min(10).optional().allow(''),
    cooking_time: Joi.string().trim().optional().allow(''),
    serving_size: Joi.string().trim().optional().allow(''),
    difficulty_level: Joi.string()
      .valid('Easy', 'Medium', 'Hard')
      .optional()
      .allow(''),
    category_id: Joi.number().integer().optional().allow(null),
    image_url: Joi.string().allow(null, '').optional(),
  })
  .min(1) // Pastikan setidaknya satu field diupdate
  .required() // Pastikan object tidak kosong

exports.deleteSchema = Joi.object().keys({
  id: Joi.number().integer().required(), // Validasi ID resep yang harus ada dan merupakan angka
})
