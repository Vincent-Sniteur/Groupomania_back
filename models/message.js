// Import mongoose
const mongoose = require('mongoose')

// Shema user
const messageSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String, default: '' },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: [String], default: [] },
})


// Export user model
module.exports = mongoose.model('Messages', messageSchema)