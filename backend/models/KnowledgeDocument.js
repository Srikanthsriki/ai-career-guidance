const mongoose = require('mongoose');

const KnowledgeDocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  careerCategory: { type: String, required: true },
  tags: { type: [String], default: [] },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  sourceName: { type: String, required: true },
  sourceUrl: { type: String, default: '' },
  verified: { type: Boolean, default: true },
  vectorEmbedding: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KnowledgeDocument', KnowledgeDocumentSchema);

