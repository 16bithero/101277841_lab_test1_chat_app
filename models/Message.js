const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    from_user: {
        type: String
    },
    room: {
        type: String
    }, 
    message: {
        type: String
    },
    dateSent: {
        type: Date,
        default: Date.now
    },
})

const GroupMessage = mongoose.model('GroupMessage', GroupSchema)
module.exports = GroupMessage