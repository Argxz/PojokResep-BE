'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A user can have many recipes
      User.hasMany(models.Recipe, {
        foreignKey: 'user_id',
        as: 'recipes',
      })
      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments',
      })
      User.hasMany(models.Rating, {
        foreignKey: 'user_id',
        as: 'ratings',
      })
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      roles: {
        type: DataTypes.STRING,
        defaultValue: 'user',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
    },
  )
  return User
}
