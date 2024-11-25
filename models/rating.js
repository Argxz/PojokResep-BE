'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi dengan User
      Rating.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      })
      // Relasi dengan Category
      Rating.belongsTo(models.Recipe, {
        foreignKey: 'recipe_id',
        as: 'recipe',
      })
    }
  }
  Rating.init(
    {
      recipe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1, // Nilai minimum
          max: 5, // Nilai maksimum
          isInt: true, // Harus berupa angka bulat
        },
      },
    },
    {
      sequelize,
      modelName: 'Rating',
      tableName: 'Ratings',
    },
  )
  return Rating
}
