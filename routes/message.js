// import express
const express = require('express')

// Import auth middleware
const auth = require('../middleware/auth')

// Import multer middleware
const multer = require('../middleware/multer-config')

// Import controllers
const messageCtrl = require('../controllers/message')


// ROUTER:
const router = express.Router()

// Import function retrieve all messages
router.get('/', auth, messageCtrl.getAllMessages)

// Import function creates message
router.post('/', auth, multer, messageCtrl.createMessage)

// Import function retrieve 1 message
router.get('/:id', auth, messageCtrl.getOneMessage)

// Import function modify a message
router.put('/:id', auth, multer, messageCtrl.modifyMessage)

// Import function delete a message
router.delete('/:id', auth, multer, messageCtrl.deleteMessage)

// Import function add like & dislike in a message
router.post('/:id/like', auth, messageCtrl.likeMessage)



// Export router for app.js
module.exports = router