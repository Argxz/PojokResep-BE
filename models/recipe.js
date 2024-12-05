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
      Recipe.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      })
      // Relasi dengan Category
      Recipe.belongsTo(models.Categories, {
        foreignKey: 'category_id',
        as: 'category',
      })
      Recipe.hasMany(models.Comment, {
        foreignKey: 'recipe_id',
        as: 'comment',
        onDelete: 'CASCADE',
      })
      Recipe.hasMany(models.Rating, {
        foreignKey: 'recipe_id',
        as: 'rating',
        onDelete: 'CASCADE',
      })
    }
  }
  Recipe.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ingredients: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cooking_time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      serving_size: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      difficulty_level: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Recipe',
      tableName: 'Recipes',
    },
  )
  return Recipe
}
