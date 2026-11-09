const mongoose = require('mongoose');

const QuestionEvaluationSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  category: { type: String, default: 'Technical' },
  difficulty: { type: String, default: 'Intermediate' },
  studentAnswer: { type: String, default: '' },
  score: { type: Number, default: 0 },
  relevance: { type: Number, default: 0 },
  technicalAccuracy: { type: Number, default: 0 },
  clarity: { type: Number, default: 0 },
  problemSolving: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  strengths: { type: [String], default: [] },
  areasForImprovement: { type: [String], default: [] },
  suggestedAnswerApproach: { type: String, default: '' },
  evaluatedAt: { type: Date, default: Date.now }
});

const InterviewSessionSchema = new mongoose.Schema({
  studentProfileId: { type: String, default: '' },
  studentName: { type: String, default: '' },
  career: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  categories: { type: [String], default: ['Technical', 'Behavioral'] },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  questions: [QuestionEvaluationSchema],
  overallScore: { type: Number, default: 0 },
  performanceRating: { type: String, default: 'Pending' },
  finalReport: {
    summary: { type: String, default: '' },
    overallStrengths: { type: [String], default: [] },
    keyActionItems: { type: [String], default: [] }
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('InterviewSession', InterviewSessionSchema);

