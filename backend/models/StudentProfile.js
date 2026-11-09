const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  email: { type: String, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  education: { type: String, required: true, trim: true },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  programmingKnowledge: { type: String, required: true, trim: true },
  experience: { type: String, default: 'Beginner' },
  preferredCareer: { type: String, trim: true, default: '' },
  validationNotes: { type: String, default: '' },
  isAiValidated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);

