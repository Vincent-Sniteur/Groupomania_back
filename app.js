// REQUIEREMENTS:
// Import express
const express = require('express')
// Import helmet for security headers
const helmet = require("helmet");
// Import mongoose for database
const mongoose = require('mongoose')
// Import dotenv config for database connection security
require('dotenv').config()


// ROUTER:
// Import route for user
const userRoutes = require('./routes/user')
// Import route for message
const messageRoutes = require('./routes/message')
// Import for multer img
const path = require('path')

// CONNECTION TO MONGODB with dotenv 
mongoose.connect(
  process.env.SECRET_DB,
  { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(() => console.log("MongoDB Connection Error"))



// Declare app
const app = express()
// Use helmet for security headers
app.use(helmet())

// CORS : General authorization / All requests
app.use((req, res, next) => {
    // Allow all requests
    res.setHeader('Access-Control-Allow-Origin', '*')
    // Allow requests with headers / headers
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
    // Allow requests with GET, POST, PUT, DELETE...
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    // Allow preflight requests (OPTIONS for Helmet protection)
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
})


// MIDDLEWARE:
// Intersect requests that have JSON in the body object & parse it on req.body & Add 3Mb limit for img
app.use(express.json({limit: '3mb'}))

// Auth user
// app.use('/', helloWorld)
app.use('/auth', userRoutes)

// Message
app.use('/message', messageRoutes)

// Img folder
app.use('/images', express.static(path.join(__dirname, 'images')))


// EXPORT:
// Export app for server.js
module.exports = app