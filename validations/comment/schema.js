const Joi = require('joi')

// Skema untuk membuat komentar baru
exports.create = Joi.object().keys({
  recipe_id: Joi.number().integer().positive().required(),
  user_id: Joi.number().integer().positive().required(), // Tambahkan user_id ke schema
  content: Joi.string().trim().min(3).max(500).required().messages({
    'string.min': 'Komentar minimal 3 karakter',
    'string.max': 'Komentar maksimal 500 karakter',
    'any.required': 'Komentar harus diisi',
  }),
})

// Skema untuk update komentar
exports.update = Joi.object().keys({
  content: Joi.string().trim().min(3).max(500).required().messages({
    'string.min': 'Komentar minimal 3 karakter',
    'string.max': 'Komentar maksimal 500 karakter',
    'any.required': 'Komentar harus diisi',
  }),
})
