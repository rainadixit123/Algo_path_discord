const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  userId: String,
  username: String,
  topic: String,
  description: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});


module.exports =mongoose.models.Doubt ||mongoose.model("Doubt", doubtSchema);

