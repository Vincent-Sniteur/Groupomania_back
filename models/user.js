// Import mongoose
const mongoose = require('mongoose')

// Import unique validator (to check if email is unique)
const uniqueValidator = require('mongoose-unique-validator')

// Shema user
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    username: { type: String, default: Math.random().toString(36).substring(2, 15)}, // Add a default username randomy generated
    createdAt: { type: Date, default: Date.now },
    lastConnection: { type: Date, default: Date.now },
    avatar: { type: String, default: 'http://localhost:3000/images/profil.png' }, // Default avatar change to good link
    bio: { type: String, default: 'No information' },
    location: { type: String, default: 'Somewhere' },
    numberOfPosts: { type: Number, default: 0 },
    numberOfLikes: { type: Number, default: 0 },
    numberOfLikesReceived: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    status: { type: String, default: 'offline' },
    messages: { type: Array, default: [] }
})

// Add unique validator to userSchema
userSchema.plugin(uniqueValidator)



// Export user model
module.exports = mongoose.model('User', userSchema)