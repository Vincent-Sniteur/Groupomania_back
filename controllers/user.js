// Import bcrypt for hash password
const bcrypt = require('bcrypt')

// Import model User
const User = require('../models/user')

// Import jwt for auth token generation & verification
const jwt = require('jsonwebtoken')


// Singnup export (create user + hash password)
exports.register = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // 10 = Number of times the password is hashed
        .then(hash => { // Create new user & hash password
            const user = new User({
                email: req.body.email,
                password: hash
            })
            user.save() // Save user in database
                .then(() => res.status(201).json({
                    message: 'Utilisateur créé !',
                    userId : user._id,
                    token : jwt.sign(
                        { userId: user._id },
                        `${process.env.JWT_TOKEN}`,
                        { expiresIn: '24h' }), // Create token with userId and expires in 24h
                        username: user.username,
                        role: user.role,
                        bio: user.bio,
                        avatar: user.avatar,
                        numberOfPosts: user.numberOfPosts,
                        numberOfLikes: user.numberOfLikes,
                        numberOfLikesReceived: user.numberOfLikesReceived,
                        isAdmin: user.isAdmin,
                        isBanned: user.isBanned,
                        status: user.status,
                        messages: user.messages
                }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}

// Login export (check if user exist + check password hach & generate token)
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) // Find user by email
        .then(user => {
            if (user === null) { // If user not found & return error message for no leak information
                return res.status(401).json({ message: 'Identifiant & mot de passe incorrecte.' })
            }
            else {
                bcrypt.compare(req.body.password, user.password) // Compare password with hash
                .then(valid => {
                    if (!valid) { // If password not valid & return error message for no leak information
                        return res.status(401).json({ message: 'Identifiant & mot de passe incorrecte.' })
                    }
                    res.status(200).json({ // If password valid
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            `${process.env.JWT_TOKEN}`,
                            { expiresIn: '24h' }), // Create token with userId and expires in 24h
                            username: user.username,
                            role: user.role,
                            bio: user.bio,
                            avatar: user.avatar,
                            numberOfPosts: user.numberOfPosts,
                            numberOfLikes: user.numberOfLikes,
                            numberOfLikesReceived: user.numberOfLikesReceived,
                            isAdmin: user.isAdmin,
                            isBanned: user.isBanned,
                            status: user.status,
                            messages: user.messages
                    })
                })
                .catch(error => res.status(500).json({ error }))
        }
    })
        .catch(error => res.status(500).json({ error }))
}

// Modify user information (username, bio, avatar) upload avatar & return new user information
exports.modifyUser = (req, res, next) => {
    const userObject = req.file ?
        {
            ...JSON.parse(req.body.user),
            avatar: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body }
    User.updateOne({ _id: req.params.id }, { ...userObject, _id: req.params.id })
        .then(() => res.status(200).json({ 
            userId: req.params.id,
            username: userObject.username,
            bio: userObject.bio,
            avatar: userObject.avatar,
        }))
        .catch(error => res.status(400).json({ error }))
}

// Delete user account & delete all posts the user has created & return message + check if user is admin
// exports.deleteUser = (req, res, next) => {
//     User.findOne({ _id: req.params.id })
//         .then(user => {
//             if (user.isAdmin === true) {
//                 return res.status(401).json({ message: 'Vous ne pouvez pas supprimer un compte administrateur.' })
//             }
//             else {
//                 User.deleteOne({ _id: req.params.id })
//                     .then(() => res.status(200).json({ message: 'Utilisateur supprimé !' }))
//                     .catch(error => res.status(400).json({ error }))
//             }
//         })
//         .catch(error => res.status(500).json({ error }))
// }