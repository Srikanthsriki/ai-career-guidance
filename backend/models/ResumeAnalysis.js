const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema({
  studentProfileId: { type: String, default: '' },
  studentName: { type: String, default: '' },
  fileName: { type: String, required: true },
  extractedTextLength: { type: Number, default: 0 },
  resumeScore: { type: Number, required: true, min: 0, max: 100 },
  summary: { type: String, default: '' },
  technicalSkills: { type: [String], default: [] },
  softSkills: { type: [String], default: [] },
  strengths: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  educationSummary: { type: String, default: '' },
  projectsDetected: { type: [String], default: [] },
  experienceDetected: { type: [String], default: [] },
  improvementSuggestions: { type: [String], default: [] },
  suitableCareers: [
    {
      career: { type: String },
      score: { type: Number }
    }
  ],
  careerAlignment: {
    targetCareer: { type: String, default: '' },
    alignmentScore: { type: Number, default: 0 },
    matchingSkills: { type: [String], default: [] },
    missingCareerSkills: { type: [String], default: [] },
    careerReadiness: { type: String, default: 'Moderate' },
    actionableImprovements: { type: [String], default: [] }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);

