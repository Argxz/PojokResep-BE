const Joi = require('joi')

exports.create = Joi.object().keys({
  user_id: Joi.number().integer().required(),
  title: Joi.string().trim().min(3).max(100).required(), // Tambahkan batasan panjang
  description: Joi.string().trim().min(10).max(500).required(), // Tambahkan batasan panjang
  ingredients: Joi.string().trim().min(10).required(), // Minimal panjang ingredients
  instructions: Joi.string().trim().min(10).required(), // Minimal panjang instructions
  cooking_time: Joi.number().integer().min(1).required(), // Ubah ke number
  serving_size: Joi.number().integer().min(1).required(), // Ubah ke number
  difficulty_level: Joi.string()
    .valid('Easy', 'Medium', 'Hard') // Sesuaikan dengan opsi di frontend
    .required(),
  category_id: Joi.number().integer().required(),
  image_url: Joi.string().uri().allow(null), // Opsional
})

exports.update = Joi.object()
  .keys({
    user_id: Joi.string().optional(),
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
  id: Joi.number().integer().required(), // Validasi ID resep yang harus ada dan merupakan angka
  user_id: Joi.string().required(), // Pastikan user_id juga ada dan merupakan string
})
