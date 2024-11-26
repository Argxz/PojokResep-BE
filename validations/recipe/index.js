const { create, update, deleteSchema } = require('./schema')
const { Categories } = require('../../models')

const recipeValidation = {
  validateCreatePayload: (payload) => {
    const validationResult = create.validate(payload)

    if (validationResult.error) {
      throw validationResult.error.message
    }
  },
  validateUpdatePayload: async (payload) => {
    try {
      // Jika ada category_id, validasi terlebih dahulu
      if (payload.category_id) {
        const category = await Categories.findByPk(payload.category_id)

        if (!category) {
          throw new Error('Category ID tidak valid')
        }
      }

      // Validasi keseluruhan payload
      const validationResult = update.validate(payload)

      if (validationResult.error) {
        throw new Error(validationResult.error.details[0].message)
      }
    } catch (error) {
      throw error
    }
  },
  validateDeletePayload: (payload) => {
    const validationResult = deleteSchema.validate(payload)

    if (validationResult.error) {
      throw new Error(validationResult.error.details[0].message)
    }
  },
}

module.exports = recipeValidation
