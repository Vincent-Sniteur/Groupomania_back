// import Shema from mongoose for message
const Message = require('../models/message')
const fs = require('fs')

// export function for create message
exports.createMessage = (req, res, next) => {
    const messageObject = JSON.parse(req.body.message)
    delete messageObject._id
    delete messageObeject._userId
    const Message = new Message({
        ...messageObject,
        userId: req.body.userId,
        username: req.body.username,
        date: req.body.date,
        image: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    message.save()
        .then(() => res.status(201).json({ message: 'Message enregistré !'}))
        .catch(error => res.status(400).json({ error}))
}

// export function for delete message
exports.deleteMessage = (req, res, next) => {
    Message.findOne({ _id: req.params.id })
        .then(message => {
            if (message.userId.toString() !== req.auth.userId) {
                return res.status(403).json({ error: 'Unauthorized request' })
            }
            else {
                const filename = message.image.split('/images/')[1]
                fs.unlink(`images/${filename}`, () => {
                    Message.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Message supprimé !' }))
                        .catch(error => res.status(401).json({ error }))
                })
            }
        })
        .catch(error => res.status(404).json({ error }))
}

// export function for modify message
exports.modifyMessage = (req, res, next) => {
    const messageObject = req.file ? {
            ...JSON.parse(req.body.message),
            image: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body }

        delete messageObject._userId // Protect injection of userId
        Message.findOne({ _id: req.params.id })
            .then(message => {
                if (message.userId.toString() !== req.auth.userId) {
                    return res.status(403).json({ error: 'Unauthorized request' })
                }
                else {
                    Message.updateOne({ _id: req.params.id }, { ...messageObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Message modifié !' }))
                        .catch(error => res.status(400).json({ error }))
                }
            })
            .catch(error => res.status(404).json({ error }))
}

// export function for get one message
exports.getOneMessage = (req, res, next) => {
    Message.findOne({ _id: req.params.id })
        .then(message => res.status(200).json(message))
        .catch(error => res.status(404).json({ error }))
}

// export function for get all messages
exports.getAllMessages = (req, res, next) => {
    Message.find()
        .then(messages => res.status(200).json(messages))
        .catch(error => res.status(400).json({ error }))
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