// import Shema from mongoose for message
const Message = require('../models/message')
const fs = require('fs')
const User = require('../models/user')


// export function for create message
exports.createMessage = (req, res, next) => {

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
                date: Date.now(),
                image: imageLink,
            })
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
    console.log(req.body)
    console.log(req.body.userId)
}

// export function for delete message
exports.deleteMessage = (req, res, next) => {
    console.log(req.body)
    console.log(req.body.userId)
}

// export function for get one message
exports.getOneMessage = (req, res, next) => {
    Message.findOne({ _id: req.params.id })
        .then(message => res.status(200).json(message))
        .catch(error => res.status(404).json({ error }))
}

// TEMPORARY DATA
const message1 = {
    _id: '1',
    userId: '62f200a2b1d6b8a3ef266e48',
    username: 'Snit - Vincent',
    date: '2020-12-01T15:00:00.000Z',
    message: 'Bonjour, je suis un message',
    image: '',
    likes: 0,
    usersLiked: [],
}
const message2 = {
    _id: '2',
    userId: 'dqsdqsdqsdqsdqsdqsdqs',
    username: 'Jean - Dupont',
    date: '2020-12-01T15:00:00.000Z',
    message: 'un super second message',
    image: 'https://picsum.photos/300/300',
    likes: 10,
    usersLiked: [],
}

// export function for get all messages & sned onlly if user is auth
exports.getAllMessages = (req, res, next) => {
    // Message.find()
    //     .then(messages => res.status(200).json(messages))
    //     .catch(error => res.status(400).json({ error }))
    const messages = [message1, message2]
    const user = {
        _id: messages._id,
        userId: messages.userId,
        username: messages.username
    }
    res.status(200).json({posts: messages, users: user})
}

// export function for like message
exports.likeMessage = (req, res, next) => {
    const like = req.body.like
    const idMessage = req.params.id
    
    Message.findOne({ _id: idMessage })

    .then (message => {
        // Check If user already like the message
        const includesId = !message.usersLiked.includes(req.body.userId) && !message.usersDisliked.includes(req.body.userId)

        // Like the message if user not already liked or disliked return 1 & add userId to usersLiked increment by 1 like
        if( like === 1 && includesId ) {
            // Push userId in usersLiked array & increment likes
            Message.updateOne({_id:idMessage}, {$push: {usersLiked: req.body.userId}, $inc: {likes: +1}})

            .then(() => res.status(200).json({ message: 'Like added'}))
            .catch(error => res.status(400).json({ error }))
        }

        // Dislike message if user not already liked or disliked return -1 & add userId to usersdisLiked increment by 1 dislike
        else if( like === -1 && includesId ) {
            // Push userId in usersDisliked array & increment dislikes
            Message.updateOne({_id:idMessage}, {$push: {usersDisliked: req.body.userId}, $inc: {dislikes: +1}})

            .then(() => res.status(200).json({ message: 'Dislike added'}))
            .catch(error => res.status(400).json({ error }))
        }

        // Delete like already exist & decrement likes & delete userId from usersLiked
        else {
            if(message.usersLiked.includes(req.body.userId)) {
            // Remove userId from usersLiked array & decrement likes
                Message.updateOne({_id:idMessage}, {$pull: {usersLiked: req.body.userId}, $inc: {likes: -1}})

                .then(() => res.status(200).json({ message: 'Like remote'}))
                .catch(error => res.status(400).json({ error }))
            }
        // Delete dislike already exist & decrement dislikes & delete userId from usersDisliked
            else if(message.usersDisliked.includes(req.body.userId)) {
            // Remove userId from usersDisliked array & decrement dislikes
                Message.updateOne({_id:idMessage}, {$pull: {usersDisliked: req.body.userId}, $inc: {dislikes: -1}})

                .then(() => res.status(200).json({ message: 'Dislike remote'}))
                .catch(error => res.status(400).json({ error }))
            }
        }
    })
    .catch(error => res.status(400).json({ error }))
}