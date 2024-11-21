'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi dengan User
      // Recipe.belongsTo(models.User, {
      //   foreignKey: 'user_id',
      //   as: 'user',
      // })
      // // Relasi dengan Category
      // Recipe.belongsTo(models.Category, {
      //   foreignKey: 'category_id',
      //   as: 'category',
      // })
    }
  }
  Recipe.init(
    {
      user_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      ingredients: DataTypes.TEXT,
      instructions: DataTypes.TEXT,
      cooking_time: DataTypes.STRING,
      serving_size: DataTypes.STRING,
      difficulty_level: DataTypes.STRING,
      category_id: DataTypes.INTEGER,
      image_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Recipe',
      tableName: 'Recipes',
    },
  )
  return Recipe
}
