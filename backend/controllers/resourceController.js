const { verifiedLearningResources, verifiedJobOpportunities } = require('../data/defaultKnowledge');

/**
 * Get verified learning resources with optional filtering
 */
exports.getLearningResources = (req, res) => {
  try {
    const { career, skill, type } = req.query;
    let results = [...verifiedLearningResources];

    if (career && career !== 'All') {
      results = results.filter(r => r.career.toLowerCase().includes(career.toLowerCase()));
    }
    if (skill) {
      results = results.filter(r => r.skill.toLowerCase().includes(skill.toLowerCase()));
    }
    if (type && type !== 'All') {
      results = results.filter(r => r.type.toLowerCase().includes(type.toLowerCase()));
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      resources: results
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get verified job and internship directories
 */
exports.getJobOpportunities = (req, res) => {
  try {
    const { category, type } = req.query;
    let results = [...verifiedJobOpportunities];

    if (category && category !== 'All') {
      results = results.filter(j => j.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (type && type !== 'All') {
      results = results.filter(j => j.type.toLowerCase().includes(type.toLowerCase()));
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      opportunities: results
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

