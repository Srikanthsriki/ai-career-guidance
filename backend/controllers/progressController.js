const store = require('../models/store');

/**
 * Get progress for a career track
 */
exports.getProgress = async (req, res) => {
  try {
    const career = req.query.career || 'Full Stack Web Developer';
    const profile = await store.getLatestProfile(req.query.email || req.body?.email || req.headers['x-student-email'] || null);
    const progressDoc = await store.getProgress(career, profile?._id);

    return res.status(200).json({
      success: true,
      progress: progressDoc || {
        career,
        studentProfileId: profile?._id || '',
        completedMilestones: [],
        completedTasks: [],
        overallProgressPercent: 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Toggle task completion or add milestone
 */
exports.updateProgressTask = async (req, res) => {
  try {
    const { career, taskId, taskTitle, stageNumber, completed } = req.body;
    if (!career || !taskId) {
      return res.status(400).json({ success: false, error: "career and taskId are required." });
    }

    const profile = await store.getLatestProfile(req.query.email || req.body?.email || req.headers['x-student-email'] || null);
    let current = await store.getProgress(career, profile?._id);

    if (!current) {
      current = {
        career,
        studentProfileId: profile?._id || '',
        completedMilestones: [],
        completedTasks: [],
        overallProgressPercent: 0
      };
    }

    current.completedTasks = current.completedTasks || [];
    current.completedMilestones = current.completedMilestones || [];

    const existingTask = current.completedTasks.find(t => t.taskId === taskId);
    const isCompleted = completed !== undefined ? Boolean(completed) : true;

    if (existingTask) {
      existingTask.completed = isCompleted;
      existingTask.completedAt = isCompleted ? new Date() : null;
    } else {
      current.completedTasks.push({
        taskId,
        taskTitle: taskTitle || `Task ${taskId}`,
        stageNumber: stageNumber || 1,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null
      });
    }

    if (taskTitle) {
      if (isCompleted && !current.completedMilestones.includes(taskTitle)) {
        current.completedMilestones.push(taskTitle);
      } else if (!isCompleted) {
        current.completedMilestones = current.completedMilestones.filter(m => m !== taskTitle);
      }
    }

    // Dynamic recalculation of percentage
    const completedCount = current.completedTasks.filter(t => t.completed).length;
    // Assuming standard 10 milestone items across stages
    const calculatedPercent = Math.min(100, Math.round((completedCount / 10) * 100));
    current.overallProgressPercent = calculatedPercent;

    const saved = await store.saveProgress(current);

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully.",
      progress: saved
    });
  } catch (error) {
    console.error('[Progress Update Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

