const mongoose = require('../config/connect');

const solutionSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const doubtSchema = new mongoose.Schema({
  userId: String,           // who asked
  userName: String,
  question: String,
  tag: String,
  status: { type: String, default: 'Open' },
  solutions: [solutionSchema],
  resolvedBy: String,       // first answerer
  firstAnswerBy: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Doubt || mongoose.model('Doubt', doubtSchema);

