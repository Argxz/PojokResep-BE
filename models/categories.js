'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Kategori punya banyak resep
      Categories.hasMany(models.Recipe, {
        foreignKey: 'category_id',
        as: 'recipes',
      })
    }
  }
  Categories.init(
    {
      name: DataTypes.STRING,
      desc: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Categories',
      tableName: 'Categories',
    },
  )
  return Categories
}
