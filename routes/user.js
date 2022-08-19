// Import express
const express = require('express')
// Create router with express
const router = express.Router()

// Import multer middleware
const multer = require('../middleware/multer-config')


// Import controllers user
const userCtrl = require('../controllers/user')

// Route for user Register
router.post('/register', userCtrl.register)
// Route for user Login
router.post('/login', userCtrl.login)
// Route for modify user
router.put('/users/:id', multer, userCtrl.modifyUser)

// Export router
module.exports = router