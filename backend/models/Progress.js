const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  studentProfileId: { type: String, default: '' },
  career: { type: String, required: true },
  completedMilestones: { type: [String], default: [] },
  completedTasks: [
    {
      taskId: { type: String, required: true },
      taskTitle: { type: String, required: true },
      stageNumber: { type: Number, default: 1 },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date }
    }
  ],
  overallProgressPercent: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', ProgressSchema);

