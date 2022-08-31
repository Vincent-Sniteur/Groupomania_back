// import Shema from mongoose for message
const Message = require('../models/message')
const fs = require('fs')
const User = require('../models/user')


// export function for create message
exports.createMessage = (req, res, next) => {

    // If no message in request ( post only image )
    if (req.body.postMessage === "") {
        req.body.postMessage = " "
    }

    // If image if not empty decrypt base64 & save image in folder images
    let imageLink = req.body.postImage
    if(imageLink !== '') {
        console.log("image not empty")
        const base64Data = imageLink.replace(/^data:([A-Za-z-+/]+);base64,/, '')
        const type = imageLink.split(';')[0].split('/')[1]
        const name = "post-" + req.body.userId + Date.now() + "." + type
        const path = "images/posts/" + name
        console.log(name)
        fs.writeFile(path, base64Data, 'base64', function(err) {
            if (err === null) {
                console.log("New Post Img saved by user " + req.body.userId)
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
            // todo temporaire
            console.log(messageObject)
            // Save message in database & return message
            messageObject.save()
                .then(() => res.status(201).json({ messageObject }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}


// export function for modify message
exports.modifyMessage = (req, res, next) => {
    console.log(req.body.message)
    console.log(req.body.id)

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
exports.deleteMessage = (req, res, next) => {

    Message.findOne({ _id: req.params.id })
        .then(message => {
            if (!message) {
                return res.status(401).json({ error: 'Error Message not found' })
            }
            // Delete image if exist
            if (message.image !== '') {
                const name = message.image.split('/')[message.image.split('/').length - 1]
                const path = "images/posts/" + name
                fs.unlink(path, function(err) {
                    if (err === null) {
                        console.log("Post Img deleted by user " + req.body.userId)
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
exports.getOneMessage = (req, res, next) => {
    Message.findOne({ _id: req.params.id })
        .then(message => res.status(200).json({
            posts: message,
        }))
        .catch(error => res.status(404).json({ error }))
}


// Export function for get all messages & sned onlly if user is auth
exports.getAllMessages = (req, res, next) => {
    // Get all messages in database
    Message.find()

    // For each message get user info & send to frontend
    .then(messages => {
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


// export function for like message
exports.likeMessage = (req, res, next) => {

    console.log(req.body.id)
    // const like = req.body.like
    // const idMessage = req.params.id
    
    // Message.findOne({ _id: idMessage })

    // .then (message => {
    //     // Check If user already like the message
    //     const includesId = !message.usersLiked.includes(req.body.userId) && !message.usersDisliked.includes(req.body.userId)

    //     // Like the message if user not already liked or disliked return 1 & add userId to usersLiked increment by 1 like
    //     if( like === 1 && includesId ) {
    //         // Push userId in usersLiked array & increment likes
    //         Message.updateOne({_id:idMessage}, {$push: {usersLiked: req.body.userId}, $inc: {likes: +1}})

    //         .then(() => res.status(200).json({ message: 'Like added'}))
    //         .catch(error => res.status(400).json({ error }))
    //     }

    //     // Dislike message if user not already liked or disliked return -1 & add userId to usersdisLiked increment by 1 dislike
    //     else if( like === -1 && includesId ) {
    //         // Push userId in usersDisliked array & increment dislikes
    //         Message.updateOne({_id:idMessage}, {$push: {usersDisliked: req.body.userId}, $inc: {dislikes: +1}})

    //         .then(() => res.status(200).json({ message: 'Dislike added'}))
    //         .catch(error => res.status(400).json({ error }))
    //     }

    //     // Delete like already exist & decrement likes & delete userId from usersLiked
    //     else {
    //         if(message.usersLiked.includes(req.body.userId)) {
    //         // Remove userId from usersLiked array & decrement likes
    //             Message.updateOne({_id:idMessage}, {$pull: {usersLiked: req.body.userId}, $inc: {likes: -1}})

    //             .then(() => res.status(200).json({ message: 'Like remote'}))
    //             .catch(error => res.status(400).json({ error }))
    //         }
    //     // Delete dislike already exist & decrement dislikes & delete userId from usersDisliked
    //         else if(message.usersDisliked.includes(req.body.userId)) {
    //         // Remove userId from usersDisliked array & decrement dislikes
    //             Message.updateOne({_id:idMessage}, {$pull: {usersDisliked: req.body.userId}, $inc: {dislikes: -1}})

    //             .then(() => res.status(200).json({ message: 'Dislike remote'}))
    //             .catch(error => res.status(400).json({ error }))
    //         }
    //     }
    // })
    // .catch(error => res.status(400).json({ error }))
}