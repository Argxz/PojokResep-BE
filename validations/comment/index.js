const { create, update } = require('./schema')
const { Recipe } = require('../../models') // Pastikan import model Recipe

const commentValidation = {
  // Validasi payload untuk membuat komentar baru
  validateCreatePayload: async (payload) => {
    try {
      // Jika ada recipe_id, validasi terlebih dahulu
      if (payload.recipe_id) {
        const recipe = await Recipe.findByPk(payload.recipe_id)
        if (!recipe) {
          throw new Error('Recipe ID tidak valid')
        }
      }

      // Validasi keseluruhan payload
      const validationResult = create.validate(payload)

      if (validationResult.error) {
        throw new Error(validationResult.error.details[0].message)
      }

      return validationResult.value // Kembalikan nilai yang divalidasi jika diperlukan
    } catch (error) {
      throw error
    }
  },

  // Validasi payload untuk update komentar
  validateUpdatePayload: async (payload) => {
    try {
      // Validasi payload untuk update
      const validationResult = update.validateAsync(payload)

      if (validationResult.error) {
        throw new Error(validationResult.error.details[0].message)
      }
    } catch (error) {
      console.error('Validation error:', error.message)
      throw new Error('Validation failed: ' + error.message)
    }
  },
}

module.exports = commentValidation
