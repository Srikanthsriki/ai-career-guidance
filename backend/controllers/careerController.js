const store = require('../models/store');
const { generateGeminiContent } = require('../services/geminiService');

/**
 * Intelligent deterministic domain model calculation
 */
function computeDeterministicRecommendation(profile) {
  const skillsText = (profile.skills || []).join(' ').toLowerCase();
  const progText = (profile.programmingKnowledge || '').toLowerCase();
  const interestsText = (profile.interests || []).join(' ').toLowerCase();
  const prefText = (profile.preferredCareer || '').toLowerCase();
  const combined = `${skillsText} ${progText} ${interestsText} ${prefText}`;

  // Domain scores
  const tracks = [
    {
      career: "AI & Machine Learning Engineer",
      keywords: ["python", "machine learning", "ai", "deep learning", "pytorch", "tensorflow", "math", "algorithms", "data", "pandas", "numpy"],
      technicalSkills: ["Python", "PyTorch/TensorFlow", "Scikit-Learn", "Data Preprocessing", "Linear Algebra", "LLMs & RAG Architectures"],
      softSkills: ["Analytical Thinking", "Continuous Learning", "Research Orientation", "Complex Problem Solving"],
      jobRoles: ["Machine Learning Engineer", "AI Research Associate", "NLP Specialist", "Computer Vision Engineer"],
      opportunities: ["Autonomous Systems", "Healthcare AI", "Enterprise Generative AI", "FinTech Predictive Analytics"],
      difficulty: "Advanced"
    },
    {
      career: "Full Stack Web Developer",
      keywords: ["javascript", "react", "html", "css", "node", "web", "frontend", "backend", "express", "mongo", "sql", "api"],
      technicalSkills: ["JavaScript/TypeScript", "React.js", "Node.js & Express", "REST & GraphQL APIs", "MongoDB / PostgreSQL", "Docker & CI/CD"],
      softSkills: ["Team Collaboration", "Debugging Persistence", "Agile Mindset", "User Empathy"],
      jobRoles: ["Full Stack Developer", "Frontend Engineer", "Backend Developer", "API & Cloud Integration Engineer"],
      opportunities: ["SaaS Startups", "E-Commerce Platforms", "Digital Transformation Agencies", "Enterprise Web Apps"],
      difficulty: "Intermediate"
    },
    {
      career: "Data Scientist",
      keywords: ["data", "sql", "analysis", "statistics", "python", "tableau", "bi", "analytics", "visualization", "excel", "r"],
      technicalSkills: ["Python/R", "Advanced SQL", "Pandas & NumPy", "Statistical Inference", "PowerBI/Tableau", "Machine Learning Models"],
      softSkills: ["Data Storytelling", "Business Acumen", "Curiosity", "Critical Evaluation"],
      jobRoles: ["Associate Data Scientist", "Data Analyst", "Business Intelligence Engineer", "Quantitative Analyst"],
      opportunities: ["Financial Services", "Supply Chain Optimization", "Healthcare Informatics", "Marketing Analytics"],
      difficulty: "Intermediate"
    },
    {
      career: "Cloud & DevOps Engineer",
      keywords: ["cloud", "aws", "docker", "devops", "linux", "kubernetes", "ci/cd", "terraform", "bash", "servers", "automation"],
      technicalSkills: ["Linux Administration", "Docker & Kubernetes", "AWS/Azure/GCP", "Terraform (IaC)", "GitHub Actions / CI-CD", "Monitoring (Prometheus)"],
      softSkills: ["Systemic Reliability Focus", "High-Pressure Incident Management", "Automation First", "Cross-team Communication"],
      jobRoles: ["Junior DevOps Engineer", "Cloud Associate", "Site Reliability Engineer (SRE)", "Build & Release Engineer"],
      opportunities: ["High-Traffic Web Infrastructure", "Cloud Migration Consulting", "Banking Infrastructure", "Platform Engineering"],
      difficulty: "Intermediate"
    },
    {
      career: "Cybersecurity Specialist",
      keywords: ["security", "cyber", "network", "hacking", "ethical", "linux", "cryptography", "firewall", "penetration", "soc"],
      technicalSkills: ["Network Protocols & Wireshark", "OWASP Top 10 Web Security", "Kali Linux & Metasploit", "Cryptography Essentials", "SIEM Tools", "Security Auditing"],
      softSkills: ["Adversarial Thinking", "Ethical Integrity", "Meticulous Attention to Detail", "Crisis Communication"],
      jobRoles: ["Junior SOC Analyst", "Penetration Tester", "Information Security Associate", "Vulnerability Assessment Analyst"],
      opportunities: ["Defense & Government", "Fintech & Banking", "Cloud Security Auditing", "Cyber Risk Advisory"],
      difficulty: "Intermediate"
    }
  ];

  // Calculate score for each
  const evaluated = tracks.map(track => {
    let matchCount = 0;
    track.keywords.forEach(kw => {
      if (combined.includes(kw)) matchCount += 1;
    });
    // Base match score between 55% and 94%
    const score = Math.min(94, Math.max(55, Math.round(55 + (matchCount * 6.5))));
    return { ...track, score };
  });

  evaluated.sort((a, b) => b.score - a.score);

  const bestFit = evaluated[0];
  const alternatives = evaluated.slice(1, 4).map(alt => ({
    title: alt.career,
    matchScore: alt.score,
    reason: `Strong complementary alignment with your foundational programming skills and related problem-solving interests.`,
    difficulty: alt.difficulty
  }));

  // Skill Gap
  const existingSkills = [];
  const missingSkills = [];

  bestFit.technicalSkills.forEach(reqSkill => {
    const isPresent = (profile.skills || []).some(s => s.toLowerCase().includes(reqSkill.toLowerCase().slice(0, 4)));
    if (isPresent) {
      existingSkills.push({
        skill: reqSkill,
        currentProficiency: 70,
        requiredProficiency: 85
      });
    } else {
      missingSkills.push({
        skill: reqSkill,
        priority: missingSkills.length < 2 ? "High" : "Medium",
        requiredProficiency: 80,
        suggestedImprovement: `Study fundamental concepts, complete 2 practical exercises, and build a milestone project integrating ${reqSkill}.`
      });
    }
  });

  // Roadmap
  const roadmap = [
    {
      stageNumber: 1,
      stageTitle: "Foundations & Core Prerequisites",
      level: "Beginner",
      estimatedDuration: "4-6 weeks",
      topics: ["Core syntax & idioms", "Data structures and algorithmic problem solving", "Version control with Git & GitHub", "Fundamental architectural paradigms"],
      skillsToDevelop: [bestFit.technicalSkills[0] || "Core Programming", "Git", "Problem Solving"],
      practiceActivities: ["Solve 30 algorithmic problems", "Build 2 small standalone console or utility tools", "Commit clean code to GitHub daily"],
      milestones: ["Version Control Mastery", "Core Language Proficiency Exam"]
    },
    {
      stageNumber: 2,
      stageTitle: "Specialized Frameworks & Tooling",
      level: "Intermediate",
      estimatedDuration: "6-8 weeks",
      topics: ["Modern industry frameworks", "Database integration and CRUD operations", "API communication and async pipelines", "Unit testing and debugging"],
      skillsToDevelop: [bestFit.technicalSkills[1] || "Frameworks", bestFit.technicalSkills[2] || "Databases"],
      practiceActivities: ["Develop a full-featured prototype application", "Integrate third-party RESTful services", "Write unit test suites covering edge cases"],
      milestones: ["Functional Prototype Deployment", "Database Architecture Certification"]
    },
    {
      stageNumber: 3,
      stageTitle: "Production Engineering & Advanced Capstone",
      level: "Advanced",
      estimatedDuration: "6-8 weeks",
      topics: ["Performance optimization and profiling", "Security hardening and best practices", "CI/CD automated deployment pipelines", "Scalable cloud hosting"],
      skillsToDevelop: [bestFit.technicalSkills[3] || "Cloud & DevOps", bestFit.technicalSkills[4] || "Security"],
      practiceActivities: ["Deploy production-grade capstone project on cloud", "Implement automated testing and CI/CD", "Conduct user load testing and code audit"],
      milestones: ["Production-Ready Portfolio Capstone", "Final Career Interview Readiness"]
    }
  ];

  // Recommended Projects
  const recommendedProjects = [
    {
      title: `${bestFit.career} Core Interactive Showcase`,
      description: `A hands-on, end-to-end practical project demonstrating your mastery in ${bestFit.technicalSkills.slice(0, 3).join(', ')}.`,
      requiredTechnologies: bestFit.technicalSkills.slice(0, 3),
      difficulty: "Intermediate",
      expectedLearningOutcomes: ["Full lifecycle implementation", "Clean modular code architecture", "Live deployed demo for portfolio"]
    },
    {
      title: `Enterprise Analytics & Dashboard Platform for ${bestFit.career}`,
      description: `Production-ready application handling asynchronous data processing, user authorization, and data visualizations.`,
      requiredTechnologies: [bestFit.technicalSkills[0], bestFit.technicalSkills[2] || "Databases", "Cloud"],
      difficulty: "Advanced",
      expectedLearningOutcomes: ["Database scalability", "Secure authentication", "Real-world engineering practices"]
    }
  ];

  return {
    studentProfileId: profile._id || '',
    studentName: profile.name || '',
    bestFitCareer: bestFit.career,
    matchScore: bestFit.score,
    recommendationExplanation: `Based on your academic background in ${profile.education}, your hands-on programming experience with ${profile.programmingKnowledge}, and your indicated skills (${(profile.skills || []).join(', ')}), ${bestFit.career} represents the highest compatibility career pathway with sustainable industry growth.`,
    alternativeCareers: alternatives,
    requiredTechnicalSkills: bestFit.technicalSkills,
    requiredSoftSkills: bestFit.softSkills,
    relevantJobRoles: bestFit.jobRoles,
    careerOpportunities: bestFit.opportunities,
    personalizedAdvice: `Focus your immediate preparation on closing high-priority missing skills like ${missingSkills.slice(0, 2).map(s => s.skill).join(' and ')}. Build tangible projects showcasing your skills on GitHub.`,
    skillGap: {
      existingSkills,
      missingSkills
    },
    roadmap,
    recommendedProjects
  };
}

/**
 * Generate Career Recommendation using Gemini or domain engine
 */
exports.generateRecommendation = async (req, res) => {
  try {
    const studentEmail = req.body.email || req.query.email || req.headers['x-student-email'] || null;
    const profile = await store.getLatestProfile(studentEmail);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "No student profile found. Please create and validate your student profile first."
      });
    }

    const prompt = `Analyze this verified student profile and provide a rigorous career recommendation report.
Student Details:
- Name: ${profile.name}
- Education: ${profile.education}
- Current Skills: ${(profile.skills || []).join(', ')}
- Interests: ${(profile.interests || []).join(', ')}
- Programming Knowledge: ${profile.programmingKnowledge}
- Experience Level: ${profile.experience}
- Preferred Career: ${profile.preferredCareer || 'Open to recommendations'}

Respond strictly with a JSON object adhering to this schema:
{
  "bestFitCareer": "string (e.g., Full Stack Web Developer, AI & Machine Learning Engineer, Data Scientist, Cloud & DevOps Engineer, Cybersecurity Specialist)",
  "matchScore": number (50 to 98 based on real alignment),
  "recommendationExplanation": "detailed justification citing their actual skills and education",
  "alternativeCareers": [
    { "title": "string", "matchScore": number, "reason": "string", "difficulty": "Beginner|Intermediate|Advanced" }
  ],
  "requiredTechnicalSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "requiredSoftSkills": ["softSkill1", "softSkill2", "softSkill3"],
  "relevantJobRoles": ["role1", "role2", "role3"],
  "careerOpportunities": ["opp1", "opp2", "opp3"],
  "personalizedAdvice": "string actionable career advice",
  "skillGap": {
    "existingSkills": [
      { "skill": "string", "currentProficiency": number (1-100), "requiredProficiency": number (1-100) }
    ],
    "missingSkills": [
      { "skill": "string", "priority": "High|Medium|Low", "requiredProficiency": number (1-100), "suggestedImprovement": "string" }
    ]
  },
  "roadmap": [
    {
      "stageNumber": 1,
      "stageTitle": "string",
      "level": "Beginner|Intermediate|Advanced",
      "estimatedDuration": "string",
      "topics": ["topic1", "topic2"],
      "skillsToDevelop": ["skill1"],
      "practiceActivities": ["activity1"],
      "milestones": ["milestone1"]
    }
  ],
  "recommendedProjects": [
    {
      "title": "string",
      "description": "string",
      "requiredTechnologies": ["tech1", "tech2"],
      "difficulty": "Beginner|Intermediate|Advanced",
      "expectedLearningOutcomes": ["outcome1"]
    }
  ]
}`;

    const systemInstruction = "You are a professional software architect and university career counselor. Generate accurate, practical, and highly realistic career recommendations. Avoid arbitrary claims.";

    let recommendationData = await generateGeminiContent(prompt, systemInstruction, true);

    if (!recommendationData || !recommendationData.bestFitCareer) {
      // Deterministic fallback
      recommendationData = computeDeterministicRecommendation(profile);
    } else {
      recommendationData.studentProfileId = profile._id || '';
      recommendationData.studentName = profile.name || '';
    }

    const savedDoc = await store.saveRecommendation(recommendationData);

    return res.status(200).json({
      success: true,
      data: savedDoc
    });
  } catch (error) {
    console.error('[Career Controller Error]:', error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate career recommendation."
    });
  }
};

/**
 * Get latest recommendation
 */
exports.getLatestRecommendation = async (req, res) => {
  try {
    const studentEmail = req.query.email || req.headers['x-student-email'] || null;
    let rec = null;
    if (studentEmail) {
      const profile = await store.getLatestProfile(studentEmail);
      if (profile) {
        rec = await store.getLatestRecommendation(profile._id);
      }
    }
    return res.status(200).json({
      success: true,
      data: rec
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Compare Careers
 */
exports.compareCareers = async (req, res) => {
  try {
    const { careers } = req.body;
    const careerList = Array.isArray(careers) && careers.length >= 2
      ? careers
      : ["Full Stack Web Developer", "AI & Machine Learning Engineer", "Cloud & DevOps Engineer"];

    const comparisonData = careerList.map(c => {
      let requiredSkills = ["Programming", "System Design", "Git"];
      let educationReq = "Bachelor's in Computer Science or related STEM field";
      let opportunities = "High Global Demand across SaaS and enterprise";
      let difficulty = "Intermediate";
      let baseMatch = 78;

      if (c.toLowerCase().includes('ai') || c.toLowerCase().includes('machine')) {
        requiredSkills = ["Python", "PyTorch", "Linear Algebra", "RAG & LLMs", "MLOps"];
        educationReq = "B.Tech/B.S. in CS, Data Science, Math, or AI certification";
        opportunities = "Fastest-growing sector with exponential enterprise investment";
        difficulty = "Advanced";
        baseMatch = 84;
      } else if (c.toLowerCase().includes('web') || c.toLowerCase().includes('full stack')) {
        requiredSkills = ["JavaScript/TypeScript", "React", "Node.js", "Databases (SQL/NoSQL)", "APIs"];
        educationReq = "B.Tech, BCA, MCA, or relevant software portfolio";
        opportunities = "Continuous volume of junior to senior full stack developer roles";
        difficulty = "Intermediate";
        baseMatch = 88;
      } else if (c.toLowerCase().includes('cloud') || c.toLowerCase().includes('devops')) {
        requiredSkills = ["Linux", "AWS/GCP", "Docker", "Kubernetes", "CI/CD", "Terraform"];
        educationReq = "Degree in Computer Science or IT with Cloud Certifications";
        opportunities = "Crucial mission-critical role in virtually all digital enterprises";
        difficulty = "Intermediate to Advanced";
        baseMatch = 76;
      } else if (c.toLowerCase().includes('data')) {
        requiredSkills = ["Python", "SQL", "Statistics", "PowerBI/Tableau", "Machine Learning"];
        educationReq = "Degree in CS, Statistics, Mathematics, or Economics";
        opportunities = "High demand across financial, healthcare, and retail sectors";
        difficulty = "Intermediate";
        baseMatch = 80;
      } else if (c.toLowerCase().includes('cyber') || c.toLowerCase().includes('security')) {
        requiredSkills = ["Networking (TCP/IP)", "Linux", "OWASP Top 10", "Ethical Hacking", "SIEM"];
        educationReq = "B.Tech in CS/Cybersecurity or CompTIA Security+ / CEH";
        opportunities = "Critical shortage of cybersecurity analysts globally";
        difficulty = "Intermediate";
        baseMatch = 75;
      }

      return {
        career: c,
        matchScore: baseMatch,
        learningDifficulty: difficulty,
        educationalRequirement: educationReq,
        requiredSkills,
        availableJobRoles: [`Junior ${c}`, `Mid-level ${c}`, `Lead ${c}`],
        careerOpportunities: opportunities,
        prepTimeMonths: difficulty === "Advanced" ? "8 - 12 months" : "5 - 8 months"
      };
    });

    return res.status(200).json({
      success: true,
      comparisons: comparisonData
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

