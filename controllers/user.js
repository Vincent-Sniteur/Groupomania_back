// Import bcrypt for hash password
const bcrypt = require('bcrypt')

// Import model User
const User = require('../models/user')

// Import jwt for auth token generation & verification
const jwt = require('jsonwebtoken')

// Import FS - file system
const fs = require('fs')

// Import Model User
const user = require('../models/user')


// Singnup export (create user + hash password)
exports.register = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // 10 = Number of times the password is hashed
        .then(hash => { // Create new user & hash password
            const user = new User({
                email: req.body.email,
                password: hash
            })
            // Log - New user created
            console.log('User successfully created: ' + user.username + ' - ' + user.email + ' - ' + user._id)
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
                        status: user.status,
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
                            status: user.status,
                    })
                    // Log - User logged
                    console.log('User successfully logged in: ' + user.username + ' - ' + user.email + ' - ' + user._id)
                })
                .catch(error => res.status(500).json({ error }))
        }
    })
        .catch(error => res.status(500).json({ error }))
}


// Modify user information (username, bio, avatar) upload avatar & return new user information
exports.modifyUser = (req, res, next) => {
    // Log - Modify user information
    console.log('Modify user information: ' + req.body.username + ' - ' + req.body.bio + ' - ' + req.body.avatar)

    // Create new user object with new information
    const username = req.body.username
    const bio = req.body.bio
    const avatar = req.body.avatar
    let newAvatar = ""

    // if the avatar is not modified, we keep the old one
    if (avatar === null) {
        newAvatar = req.body.oldAvatar
    }
    // if the avatar is modified, we upload the new one
    if (avatar !== null) {
        const base64Data = avatar.replace(/^data:([A-Za-z-+/]+);base64,/, '')
        const type = avatar.split(';')[0].split('/')[1]
        const name = "avatar-" + req.params.id + "-" + Math.random().toString(36).substring(7) + "." + type
        const path = 'images/avatars/' + name
        fs.writeFile(path, base64Data, 'base64', function(err) {
            if (err === null) {
                console.log("New Avatar saved by user: " + username + " - " + req.params.id)
            } else  {
                console.log(err)
            }
        })
        // We save the new avatar path
        newAvatar = `${process.env.PROTOCOL}://${process.env.SERVER_URL}:${process.env.PORT}/images/avatars/${name}`

        // Delete old avatar if not default avatar replaced by new avatar
        if (req.body.oldAvatar !== null && req.body.oldAvatar !== `${process.env.PROTOCOL}://${process.env.SERVER_URL}:${process.env.PORT}/images/profil.png`) {
            User.findOne({ _id: req.params.id })
                .then(user => {
                    if (user.avatar !== null) {
                        const oldAvatar = user.avatar.split('/')
                        fs.unlink('images/avatars/' + oldAvatar[oldAvatar.length - 1], (err) => {
                            if (err) {
                                console.log(err)
                            }
                        })
                    }
                })
                .catch(error => res.status(500).json({ error }))
        }
    }

    // Update user information & return new user information    
    User.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id, avatar: newAvatar })
        .then(() => res.status(200).json(
            {
                userId : req.params.id,
                username : username,
                bio : bio,
                avatar : newAvatar,
            }
        ))
        .catch(error => res.status(400).json({ error }))
}