const db = require('../database/dbEngine');
const { isDbConnected } = require('../config/db');
const { defaultKnowledgeDocuments } = require('../data/defaultKnowledge');

/**
 * Get live database statistics and health
 */
exports.getDatabaseStatus = (req, res) => {
  try {
    const stats = db.getStats();
    return res.status(200).json({
      success: true,
      mongoConnected: isDbConnected(),
      activeEngine: isDbConnected() ? 'MongoDB Atlas (Mongoose)' : stats.engine,
      details: stats
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Inspect contents of a specific collection
 */
exports.getCollection = (req, res) => {
  try {
    const { name } = req.params;
    const records = db.find(name);
    return res.status(200).json({
      success: true,
      collection: name,
      count: records.length,
      records
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export complete database JSON backup
 */
exports.exportDatabase = (req, res) => {
  try {
    const backup = db.exportAll();
    return res.status(200).json({
      success: true,
      backup
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Seed full database with sample student record and career recommendations
 */
exports.seedDatabase = (req, res) => {
  try {
    // 1. Seed knowledge
    defaultKnowledgeDocuments.forEach(doc => {
      const exists = db.findOne('knowledge', k => k.title === doc.title);
      if (!exists) {
        db.insert('knowledge', doc);
      }
    });

    // 2. Seed student profile
    const profile = db.upsert('profiles', p => p.name === 'Alex Johnson', {
      name: 'Alex Johnson',
      education: 'B.Tech in Computer Science & Engineering (Final Year)',
      skills: ['JavaScript', 'React.js', 'Node.js', 'Express', 'MongoDB', 'Git', 'REST APIs'],
      interests: ['Full Stack Web Development', 'Cloud Systems'],
      programmingKnowledge: 'Strong proficiency in JavaScript/TypeScript, intermediate Python, solid DSA foundation',
      experience: 'Intermediate',
      preferredCareer: 'Full Stack Web Developer',
      validationNotes: 'Profile passed semantic and syntactic verification.',
      isAiValidated: true
    });

    // 3. Seed recommendation
    const recommendation = db.upsert('recommendations', r => r.studentProfileId === profile._id, {
      studentProfileId: profile._id,
      studentName: profile.name,
      bestFitCareer: 'Full Stack Web Developer',
      matchScore: 88,
      recommendationExplanation: 'Based on academic background in Computer Science and hands-on JavaScript/React/Node.js skills, Full Stack Web Development represents the highest compatibility career pathway with sustainable industry growth.',
      alternativeCareers: [
        { title: 'Cloud & DevOps Engineer', matchScore: 78, reason: 'Complementary systems engineering skills.', difficulty: 'Intermediate' },
        { title: 'AI & Machine Learning Engineer', matchScore: 72, reason: 'Strong programming foundations.', difficulty: 'Advanced' }
      ],
      requiredTechnicalSkills: ['JavaScript/TypeScript', 'React.js', 'Node.js & Express', 'REST & GraphQL APIs', 'MongoDB / PostgreSQL', 'Docker & CI/CD'],
      requiredSoftSkills: ['Team Collaboration', 'Debugging Persistence', 'Agile Mindset', 'User Empathy'],
      relevantJobRoles: ['Full Stack Developer', 'Frontend Engineer', 'Backend Developer', 'API Integration Engineer'],
      careerOpportunities: ['SaaS Startups', 'E-Commerce Platforms', 'Enterprise Web Applications'],
      personalizedAdvice: 'Prioritize mastering containerization with Docker and cloud deployment on AWS/Vercel.',
      skillGap: {
        existingSkills: [
          { skill: 'JavaScript/TypeScript', currentProficiency: 80, requiredProficiency: 85 },
          { skill: 'React.js', currentProficiency: 75, requiredProficiency: 85 },
          { skill: 'Node.js & Express', currentProficiency: 70, requiredProficiency: 80 }
        ],
        missingSkills: [
          { skill: 'Docker & CI/CD', priority: 'High', requiredProficiency: 75, suggestedImprovement: 'Containerize an express app and configure GitHub Actions.' },
          { skill: 'Advanced System Design', priority: 'Medium', requiredProficiency: 80, suggestedImprovement: 'Study caching with Redis and horizontal scaling.' }
        ]
      },
      roadmap: [
        {
          stageNumber: 1,
          stageTitle: 'Core Web Architecture & APIs',
          level: 'Beginner',
          estimatedDuration: '4-6 weeks',
          topics: ['Asynchronous JavaScript', 'RESTful API Design', 'MongoDB Aggregation'],
          skillsToDevelop: ['Node.js', 'Express', 'MongoDB'],
          practiceActivities: ['Build CRUD API', 'Implement JWT auth'],
          milestones: ['API Certification', 'Database Indexing Mastery']
        },
        {
          stageNumber: 2,
          stageTitle: 'Full-Stack Integration & State',
          level: 'Intermediate',
          estimatedDuration: '6-8 weeks',
          topics: ['React Context & Hooks', 'Component Lifecycle', 'State Management'],
          skillsToDevelop: ['React.js', 'REST Integration'],
          practiceActivities: ['Develop full-stack web application'],
          milestones: ['Complete Full-Stack Capstone']
        },
        {
          stageNumber: 3,
          stageTitle: 'Production Deployment & DevOps',
          level: 'Advanced',
          estimatedDuration: '6-8 weeks',
          topics: ['Dockerization', 'CI/CD Pipelines', 'AWS S3 & EC2'],
          skillsToDevelop: ['Docker', 'Cloud Hosting'],
          practiceActivities: ['Deploy production build with SSL and custom domain'],
          milestones: ['Production Deployment Live']
        }
      ],
      recommendedProjects: [
        {
          title: 'Full Stack Web Developer Interactive Showcase',
          description: 'A hands-on, end-to-end practical project demonstrating mastery in modern JavaScript, React, and Node.js.',
          requiredTechnologies: ['React.js', 'Node.js', 'MongoDB'],
          difficulty: 'Intermediate',
          expectedLearningOutcomes: ['Full lifecycle implementation', 'Clean modular code architecture', 'Live deployed demo']
        }
      ]
    });

    // 4. Seed Progress
    db.upsert('progress', p => p.career === 'Full Stack Web Developer', {
      studentProfileId: profile._id,
      career: 'Full Stack Web Developer',
      completedMilestones: ['API Certification', 'Database Indexing Mastery'],
      completedTasks: [
        { taskId: 's1-m1', taskTitle: 'API Certification', stageNumber: 1, completed: true, completedAt: new Date() },
        { taskId: 's1-m2', taskTitle: 'Database Indexing Mastery', stageNumber: 1, completed: true, completedAt: new Date() }
      ],
      overallProgressPercent: 20
    });

    return res.status(200).json({
      success: true,
      message: 'Self-contained database successfully seeded with college demo records!',
      stats: db.getStats()
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

