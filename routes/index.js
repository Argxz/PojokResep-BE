// Import modul Express dan Router
const express = require('express')
const router = express.Router()

// Import rute-rute spesifik dari modul lain
const userRoutes = require('./user')
const categoryRoutes = require('./categories')
const recipeRoutes = require('./recipe')
const commentRoutes = require('./comment')
const ratingRoutes = require('./rating')
const adminRoutes = require('./admin')

/**
 * Konfigurasi Rute Utama Aplikasi
 *
 * Mendefinisikan jalur (endpoint) untuk setiap sumber daya utama dalam aplikasi
 * Setiap rute akan diarahkan ke modul rute spesifik yang sesuai
 */

// Rute Pengguna
router.use('/users', userRoutes)

// Rute Kategori
router.use('/categories', categoryRoutes)

// Rute Resep
router.use('/recipes', recipeRoutes)

// Rute Komentar
router.use('/comments', commentRoutes)

// Rute Rating
router.use('/ratings', ratingRoutes)

// Rute Admin
router.use('/admin', adminRoutes)

/**
 * Dokumentasi Struktur API
 *
 * Endpoint Utama:
 * - /users       : Manajemen akun pengguna
 * - /categories  : Operasi kategori resep
 * - /recipes     : Manajemen resep
 * - /comments    : Sistem komentar
 * - /ratings     : Penilaian dan ulasan
 * - /admin       : Fungsi administratif
 */

// Ekspor router utama untuk digunakan di aplikasi
module.exports = router
