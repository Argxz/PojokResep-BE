'use strict'
const { Model } = require('sequelize')
const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User punya banyak resep
      User.hasMany(models.Recipe, {
        foreignKey: 'user_id',
        as: 'recipes',
        onDelete: 'CASCADE',
      })
      //User punya banyak komentar
      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments',
        onDelete: 'CASCADE',
      })
      //User punya banyak rating
      User.hasMany(models.Rating, {
        foreignKey: 'user_id',
        as: 'ratings',
        onDelete: 'CASCADE',
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
        unique: true,
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
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 10)
        },
      },
    },
  )

  return User
}
