// Import mongoose
const mongoose = require('mongoose')

// Import unique validator (to check if email is unique)
const uniqueValidator = require('mongoose-unique-validator')

// Shema user
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Add unique validator to userSchema
userSchema.plugin(uniqueValidator)



// Export user model
module.exports = mongoose.model('User', userSchema)