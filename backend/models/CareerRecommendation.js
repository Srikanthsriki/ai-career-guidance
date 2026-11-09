const mongoose = require('mongoose');

const CareerRecommendationSchema = new mongoose.Schema({
  studentProfileId: { type: String, default: '' },
  studentName: { type: String, default: '' },
  bestFitCareer: { type: String, required: true },
  matchScore: { type: Number, required: true, min: 0, max: 100 },
  recommendationExplanation: { type: String, required: true },
  alternativeCareers: [
    {
      title: { type: String, required: true },
      matchScore: { type: Number, required: true },
      reason: { type: String, default: '' },
      difficulty: { type: String, default: 'Intermediate' }
    }
  ],
  requiredTechnicalSkills: { type: [String], default: [] },
  requiredSoftSkills: { type: [String], default: [] },
  relevantJobRoles: { type: [String], default: [] },
  careerOpportunities: { type: [String], default: [] },
  personalizedAdvice: { type: String, default: '' },
  skillGap: {
    existingSkills: [
      {
        skill: { type: String },
        currentProficiency: { type: Number }, // 1 - 100
        requiredProficiency: { type: Number } // 1 - 100
      }
    ],
    missingSkills: [
      {
        skill: { type: String },
        priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
        requiredProficiency: { type: Number, default: 75 },
        suggestedImprovement: { type: String, default: '' }
      }
    ]
  },
  roadmap: [
    {
      stageNumber: { type: Number, required: true },
      stageTitle: { type: String, required: true },
      level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
      estimatedDuration: { type: String, default: '4-6 weeks' },
      topics: { type: [String], default: [] },
      skillsToDevelop: { type: [String], default: [] },
      practiceActivities: { type: [String], default: [] },
      milestones: { type: [String], default: [] }
    }
  ],
  recommendedProjects: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      requiredTechnologies: { type: [String], default: [] },
      difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
      expectedLearningOutcomes: { type: [String], default: [] }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CareerRecommendation', CareerRecommendationSchema);

