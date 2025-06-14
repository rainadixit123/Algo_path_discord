const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
 name:{type: String},
 discordUserId:{type:String},
 isVerified: {
    type: Boolean,
    default: false
  }

});

module.exports =mongoose.models.User|| mongoose.model('User', userSchema);
