const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: [true, "Please enter username name"],
        lowercase: true
    },
    firstname: {
        type: String,
        trim: true,
        required: true,
    }, 
    lastname: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    },
})

const UserListModel = mongoose.model('UserList', UserSchema)
module.exports = UserListModel