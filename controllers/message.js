// import Shema from mongoose for message
const Message = require('../models/message')
const fs = require('fs')
const User = require('../models/user')


// export function for create message
exports.createMessage = (req, res) => {
    // Log - Message & User ID
    console.log("New message from user: " + req.body.userId + " / " + req.body.postMessage)

    // If no message in request ( post only image )
    if (req.body.postMessage === "") {
        req.body.postMessage = " "
    }

    // If image if not empty decrypt base64 & save image in folder images
    let imageLink = req.body.postImage
    if(imageLink !== '') {
        const base64Data = imageLink.replace(/^data:([A-Za-z-+/]+);base64,/, '')
        const type = imageLink.split(';')[0].split('/')[1]
        const name = "post-" + req.body.userId + Date.now() + "." + type
        const path = "images/posts/" + name
        fs.writeFile(path, base64Data, 'base64', function(err) {
            if (err === null) {
                console.log("New Image saved by user: " + req.body.userId)
            } else  {
                console.log(err)
            }
        })

        imageLink = `${process.env.PROTOCOL}://${process.env.SERVER_URL}:${process.env.PORT}/images/posts/${name}`

    }

    // Check if userId is valid & return user info to send to frontend & save the message
    User.findOne({ _id: req.body.userId })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Error User not found' })
            }
            // Create message
            const messageObject = new Message({
                userId: user._id,
                message: req.body.postMessage,
                date: new Date(),
                image: imageLink,
            })
            // Save message in database & return message
            messageObject.save()
                .then(() => res.status(201).json({ messageObject }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}


// export function for modify message
exports.modifyMessage = (req, res) => {
    // Log - Message ID by user
    console.log("Message number: " + req.params.id + " Modified in: " + req.body.message)

    Message.findOne({ _id: req.body.id })
        .then(message => {
            if (!message) {
                return res.status(401).json({ error: 'Error Message not found' })
            }
            message.message = req.body.message
            message.save()
                .then(() => res.status(201).json({ message }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}

// Export function for delete message
exports.deleteMessage = (req, res) => {
    // Log - Message ID by user
    console.log("Message number: " + req.params.id + "have been deleted")

    Message.findOne({ _id: req.params.id })
        .then(message => {
            if (!message) {
                return res.status(401).json({ error: 'Error Message not found' })
            }
            // Delete image if already exist
            if (message.image !== '') {
                const name = message.image.split('/')[message.image.split('/').length - 1]
                const path = "images/posts/" + name
                fs.unlink(path, function(err) {
                    if (err === null) {
                        console.log("Post Img deleted by user: " + req.body.userId)
                    } else  {
                        console.log(err)
                    }
                })
            }
            // Delete message in database & return message
            Message.deleteOne({ _id: req.params.id })
                .then(() => res.status(201).json({ message }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}

// export function for get one message
exports.getOneMessage = (req, res) => {
    Message.findOne({ _id: req.params.id })
        .then(message => res.status(200).json({
            posts: message,
        }))
        .catch(error => res.status(404).json({ error }))
}


// Export function for get all messages & sned onlly if user is auth
exports.getAllMessages = (req, res) => {
    // Get all messages in database
    Message.find()

    // For each message get user info & send to frontend
    .then(messages => {
        // If no messages in database return No Content status
        if (messages.length === 0) {
            return res.status(204).json({ error: 'No content' })
        }

        let messagesArray = []
        messages.forEach(message => {
            // Get user info & return
            User.findOne({ _id: message.userId })
                .then(user => {
                    messagesArray.push({
                        _id: message._id,
                        userId: message.userId,
                        message: message.message,
                        date: message.date,
                        image: message.image,
                        likes: message.likes,
                        usersLiked: message.usersLiked,
                        user: {
                            _id: user._id,
                            username: user.username,
                            avatar: user.avatar,
                            role: user.role,
                            bio: user.bio,
                            status: user.status,
                        },
                    })
                    if (messagesArray.length === messages.length) {
                        res.status(200).json({
                            posts: messagesArray,
                        })
                    }
                })
                .catch(error => res.status(404).json({ error }))
        })
    })
    .catch(error => res.status(400).json({ error }))
}


// Export system like & dislike object
exports.likeMessage = (req, res) => {
    const idMessage = req.params.id
    const idUser = req.body.userId

    Message.findOne({ _id: idMessage })
        .then(message => {
            if (!message) {
                return res.status(401).json({ error: 'Error Message not found' })
            }
            // if user already like message remove like & remove user in array usersLiked
            if (message.usersLiked.includes(idUser)) {
                message.likes = message.likes - 1
                message.usersLiked = message.usersLiked.filter(user => user !== idUser)
            } else {
                // if user not like message add like & add user in array usersLiked
                message.likes = message.likes + 1
                message.usersLiked.push(idUser)
            }
            message.save()
                .then(() => res.status(201).json({ message }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}