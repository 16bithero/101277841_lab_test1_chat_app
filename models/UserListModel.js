const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: [true, "Please enter username name"],
        unique: true
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

//This function works as a checker, if its not a new user, or updating a user's information,
// hash function will be ignored, as it is already hashed
UserSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
  });
  
  //This method compares input password to the password that has been hashed and returns a boolean response in callback
  UserSchema.methods.comparePassword = function(rawPassword, callback) {
    return callback(null, bcrypt.compareSync(rawPassword, this.password));
  };

const UserListModel = mongoose.model('UserList', UserSchema)
module.exports = UserListModel