const { register, updateUsernameEmail } = require('./schema')

const userValidation = {
  validateCreatePayload: (payload) => {
    const validationResult = register.validate(payload)

    if (validationResult.error) {
      throw validationResult.error.message
    }
  },
  validateUpdatePayload: async (payload) => {
    try {
      // Validasi payload untuk update
      const validationResult = updateUsernameEmail.validateAsync(payload)

      if (validationResult.error) {
        throw new Error(validationResult.error.details[0].message)
      }
    } catch (error) {
      console.error('Validation error:', error.message)
      throw new Error('Validation failed: ' + error.message)
    }
  },
}

module.exports = userValidation
