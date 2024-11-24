'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi dengan User
      Comment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      })
      // Relasi dengan Category
      Comment.belongsTo(models.Recipe, {
        foreignKey: 'recipe_id',
        as: 'recipe',
      })
    }
  }
  Comment.init(
    {
      recipe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'Comments',
    },
  )
  return Comment
}
