// Import mongoose
const mongoose = require('mongoose')

// Shema user
const messageSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    date: { type: String, required: true },
    message: { type: String, required: true },
    image: { type: String, default: '' },
    likes: { type: Number, required: true, default: 0 },
    dislikes: { type: Number, required: true, default: 0 },
    usersLiked: { type: [String], required: true, default: [] },
    usersDisliked: { type: [String], required: true, default: [] },
})


// Export user model
module.exports = mongoose.model('Messages', messageSchema)