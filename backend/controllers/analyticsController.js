const store = require('../models/store');
const db = require('../database/dbEngine');
const User = require('../models/User');
const { isDbConnected } = require('../config/db');

/**
 * Get comprehensive analytics aggregated across the student's entire journey
 */
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const studentEmail = req.query.email || req.headers['x-student-email'] || null;
    const profile = await store.getLatestProfile(studentEmail);
    const recommendation = await store.getLatestRecommendation(profile?._id);
    const resume = await store.getLatestResumeAnalysis(profile?._id);
    const interviews = await store.getAllInterviewSessions(profile?._id);
    const latestInterview = interviews[0] || null;
    const progress = await store.getProgress(recommendation?.bestFitCareer || 'Full Stack Web Developer', profile?._id);

    // Profile match
    const careerMatchScore = recommendation ? recommendation.matchScore : 0;
    const recommendedCareer = recommendation ? recommendation.bestFitCareer : 'Profile Incomplete';
    const alternativeCount = recommendation ? (recommendation.alternativeCareers || []).length : 0;

    // Skills counts
    const knownSkills = profile ? (profile.skills || []).length : 0;
    const skillsToLearn = recommendation && recommendation.skillGap ? (recommendation.skillGap.missingSkills || []).length : 0;

    // Roadmap progress
    const roadmapProgress = progress ? progress.overallProgressPercent : 0;
    const completedMilestones = progress ? progress.completedMilestones.length : 0;

    // Resume score
    const resumeScore = resume ? resume.resumeScore : null;

    // Interview score
    const interviewScore = latestInterview ? latestInterview.overallScore : null;

    // Holistic Readiness Calculation (weighted actual data)
    let readinessComponents = [];
    let weights = [];

    if (careerMatchScore > 0) {
      readinessComponents.push(careerMatchScore);
      weights.push(0.35);
    }
    if (roadmapProgress > 0) {
      readinessComponents.push(roadmapProgress);
      weights.push(0.25);
    }
    if (resumeScore !== null) {
      readinessComponents.push(resumeScore);
      weights.push(0.20);
    }
    if (interviewScore !== null) {
      readinessComponents.push(interviewScore);
      weights.push(0.20);
    }

    let overallReadiness = 0;
    if (weights.length > 0) {
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const weightedSum = readinessComponents.reduce((acc, val, idx) => acc + (val * weights[idx]), 0);
      overallReadiness = Math.round(weightedSum / totalWeight);
    } else {
      overallReadiness = 0;
    }

    // Skill Proficiency breakdown for Radar chart
    let radarSkills = [];
    if (recommendation && recommendation.skillGap) {
      const existing = (recommendation.skillGap.existingSkills || []).map(s => ({
        skill: s.skill,
        studentProficiency: s.currentProficiency || 70,
        requiredProficiency: s.requiredProficiency || 85
      }));
      const missing = (recommendation.skillGap.missingSkills || []).slice(0, 3).map(s => ({
        skill: s.skill,
        studentProficiency: 30,
        requiredProficiency: s.requiredProficiency || 80
      }));
      radarSkills = [...existing, ...missing].slice(0, 6);
    } else {
      // No profile yet: show required levels only, student levels start at 0
      radarSkills = [
        { skill: "Core Programming", studentProficiency: 0, requiredProficiency: 85 },
        { skill: "Data Structures", studentProficiency: 0, requiredProficiency: 80 },
        { skill: "Web Frameworks", studentProficiency: 0, requiredProficiency: 85 },
        { skill: "Databases & SQL", studentProficiency: 0, requiredProficiency: 75 },
        { skill: "Version Control", studentProficiency: 0, requiredProficiency: 80 }
      ];
    }

    // Milestones progress for Bar Chart
    const roadmapStages = recommendation ? (recommendation.roadmap || []).map(stage => {
      const completedInStage = (progress?.completedTasks || []).filter(t => t.stageNumber === stage.stageNumber && t.completed).length;
      return {
        stageName: `Stage ${stage.stageNumber}: ${stage.stageTitle.slice(0, 18)}...`,
        completed: completedInStage,
        total: Math.max(2, (stage.milestones || []).length)
      };
    }) : [];

    let studentName = profile?.name;
    if (!studentName && studentEmail) {
      const cleanEmail = String(studentEmail).trim().toLowerCase();
      const user = isDbConnected()
        ? await User.findOne({ email: cleanEmail })
        : db.findOne('users', u => u.email === cleanEmail);
      if (user) studentName = user.name;
    }

    return res.status(200).json({
      success: true,
      data: {
        hasProfile: Boolean(profile),
        studentName: studentName || 'Student',
        recommendedCareer,
        careerMatchScore,
        alternativeCount,
        knownSkills,
        skillsToLearn,
        roadmapProgress,
        completedMilestones,
        resumeScore,
        interviewScore,
        overallReadiness,
        radarSkills,
        roadmapStages
      }
    });
  } catch (error) {
    console.error('[Analytics Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get deep Career Alignment Matrix
 */
exports.getCareerAlignment = async (req, res) => {
  try {
    const studentEmail = req.query.email || req.headers['x-student-email'] || null;
    const profile = await store.getLatestProfile(studentEmail);
    const recommendation = await store.getLatestRecommendation(profile?._id);
    const resume = await store.getLatestResumeAnalysis(profile?._id);

    if (!profile || !recommendation) {
      return res.status(200).json({
        success: true,
        isConfigured: false,
        message: "Please complete your student profile and career recommendation to view alignment metrics."
      });
    }

    const targetCareer = recommendation.bestFitCareer;
    const profileAlignmentScore = recommendation.matchScore;
    const resumeAlignmentScore = resume ? resume.careerAlignment?.alignmentScore || resume.resumeScore : null;

    const skillAlignmentScore = recommendation.skillGap
      ? Math.round(
          ((recommendation.skillGap.existingSkills.length) /
            (recommendation.skillGap.existingSkills.length + recommendation.skillGap.missingSkills.length || 1)) * 100
        )
      : 70;

    let totalScore = profileAlignmentScore * 0.5 + skillAlignmentScore * 0.5;
    if (resumeAlignmentScore !== null) {
      totalScore = profileAlignmentScore * 0.4 + skillAlignmentScore * 0.3 + resumeAlignmentScore * 0.3;
    }
    const overallCareerAlignmentScore = Math.round(totalScore);

    const missingRequirements = [
      ...(recommendation.skillGap?.missingSkills.map(s => `Skill: ${s.skill} (Priority: ${s.priority})`) || []),
      ...(resume?.careerAlignment?.missingCareerSkills.map(s => `Resume: ${s}`) || [])
    ];

    const actionableImprovements = [
      `Bridge the skill gap in ${(recommendation.skillGap?.missingSkills[0]?.skill || 'core requirements')} through practical projects.`,
      `Track your milestones in the Learning Roadmap to elevate readiness.`,
      ...(resume ? resume.improvementSuggestions.slice(0, 2) : ["Upload your PDF resume to calibrate ATS keyword alignment."])
    ];

    return res.status(200).json({
      success: true,
      isConfigured: true,
      alignment: {
        targetCareer,
        overallCareerAlignmentScore,
        profileAlignmentScore,
        skillAlignmentScore,
        resumeAlignmentScore,
        careerReadiness: overallCareerAlignmentScore >= 80 ? "High Alignment" : overallCareerAlignmentScore >= 60 ? "Moderate Alignment" : "Developing Alignment",
        missingRequirements,
        actionableImprovements
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

