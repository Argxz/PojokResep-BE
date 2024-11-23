const { Categories } = require('../models')

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.findAll()
    res.json({ status: 'OK', data: categories })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getCategoryById = async (req, res) => {
  const { id } = req.params
  try {
    const category = await Categories.findByPk(id)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    return res.status(200).json(category)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the category' })
  }
}

exports.createCategory = async (req, res) => {
  const { name, desc } = req.body
  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }
  try {
    const category = await Categories.create(req.body)
    res.status(201).json({
      message: 'Category created successfully',
      data: category,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateCategory = async (req, res) => {
  const { id } = req.params
  const { name, desc } = req.body
  try {
    const category = await Categories.findByPk(id)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    await category.update({ name, desc })
    await category.reload()
    res.status(200).json({
      message: 'Category updated successfully',
      data: category,
    })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while updating the category' })
  }
}
