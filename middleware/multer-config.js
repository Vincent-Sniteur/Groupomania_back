// Import multer
const multer = require('multer')

// config mine types
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

// Config multer for file generate unique name
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    }
    , filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_')
        const extension = MIME_TYPE_MAP[file.mimetype]
        callback(null, name + Date.now() + '.' + extension)
    }
})

// Export config multer
module.exports = multer({ storage: storage }).single('image')