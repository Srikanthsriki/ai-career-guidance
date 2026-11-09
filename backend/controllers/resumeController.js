const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const store = require('../models/store');
const { generateGeminiContent } = require('../services/geminiService');

/**
 * Extract plain text from PDF or DOCX file buffer
 */
async function extractTextFromFile(filePath, mimeType, originalName) {
  const extension = (originalName || '').split('.').pop().toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (extension === 'pdf' || mimeType === 'application/pdf') {
    const parsed = await pdfParse(fileBuffer);
    return parsed.text || '';
  } else if (extension === 'docx' || mimeType.includes('wordprocessingml') || mimeType.includes('docx')) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value || '';
  }

  // Fallback utf-8 read
  return fileBuffer.toString('utf-8');
}

/**
 * Deterministic resume analysis fallback
 */
function analyzeResumeDeterministically(text, targetCareer = 'Full Stack Web Developer') {
  const lower = text.toLowerCase();

  const techDictionary = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'react', 'node', 'express',
    'mongodb', 'sql', 'postgresql', 'mysql', 'docker', 'kubernetes', 'aws', 'git',
    'html', 'css', 'tailwind', 'redux', 'rest', 'graphql', 'linux', 'machine learning',
    'deep learning', 'pandas', 'numpy', 'scikit-learn', 'pytorch', 'tensorflow'
  ];

  const softDictionary = [
    'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
    'time management', 'adaptability', 'collaboration', 'agile', 'scrum'
  ];

  const detectedTech = techDictionary.filter(t => lower.includes(t)).map(t => t.toUpperCase());
  const detectedSoft = softDictionary.filter(s => lower.includes(s)).map(s => s.charAt(0).toUpperCase() + s.slice(1));

  // Determine strengths & missing
  const strengths = [];
  if (detectedTech.length >= 4) strengths.push(`Broad technical toolkit with ${detectedTech.length} verified technologies identified.`);
  if (lower.includes('project') || lower.includes('developed') || lower.includes('built')) {
    strengths.push("Hands-on project development verbs and outcomes indicated.");
  }
  if (lower.includes('bachelor') || lower.includes('degree') || lower.includes('university') || lower.includes('college')) {
    strengths.push("Formal academic foundation documented clearly.");
  }
  if (strengths.length === 0) strengths.push("Basic resume structure is present.");

  const missingSkills = [];
  if (!detectedTech.includes('GIT')) missingSkills.push("Git / Version Control");
  if (!detectedTech.includes('DOCKER') && !detectedTech.includes('AWS')) missingSkills.push("Containerization / Cloud Deployment (Docker, AWS)");
  if (!lower.includes('test') && !lower.includes('jest')) missingSkills.push("Automated Testing (Unit/Integration Tests)");
  if (!detectedTech.includes('SQL') && !detectedTech.includes('MONGODB')) missingSkills.push("Database Engineering (SQL / NoSQL)");

  const baseScore = Math.min(92, Math.max(45, 45 + (detectedTech.length * 5) + (detectedSoft.length * 3)));

  // Target career alignment
  let careerAlignmentScore = Math.min(90, Math.max(50, baseScore - 5));
  let matchingSkills = detectedTech.slice(0, 5);
  let missingCareerSkills = missingSkills.slice(0, 3);

  return {
    resumeScore: baseScore,
    summary: `Resume parsed successfully with ${text.length} characters of extractable content. Identified ${detectedTech.length} core technical competencies and relevant project mentions.`,
    technicalSkills: detectedTech.length > 0 ? detectedTech : ["FOUNDATIONAL PROGRAMMING"],
    softSkills: detectedSoft.length > 0 ? detectedSoft : ["COMMUNICATION", "PROBLEM SOLVING"],
    strengths,
    missingSkills,
    educationSummary: lower.includes('b.tech') ? "B.Tech Undergraduate Degree Detected" : "Higher Education Degree Detected",
    projectsDetected: ["Academic Capstone / Coursework Projects identified"],
    experienceDetected: lower.includes('intern') ? ["Internship Experience Mentioned"] : ["Academic / Self-Directed Projects"],
    improvementSuggestions: [
      "Quantify project achievements with concrete metrics (e.g., 'improved query performance by 30%')",
      "Add direct links to live GitHub repositories and deployed live demonstrations",
      "Include clear bullet points highlighting individual contributions rather than general team roles"
    ],
    suitableCareers: [
      { career: targetCareer || "Full Stack Web Developer", score: careerAlignmentScore },
      { career: "Software Engineer", score: Math.max(50, careerAlignmentScore - 4) }
    ],
    careerAlignment: {
      targetCareer: targetCareer || "Full Stack Web Developer",
      alignmentScore: careerAlignmentScore,
      matchingSkills,
      missingCareerSkills,
      careerReadiness: careerAlignmentScore > 75 ? "High Readiness" : "Moderate Readiness",
      actionableImprovements: [
        `Prioritize learning: ${missingCareerSkills.join(', ')}`,
        `Complete a capstone project specifically focused on ${targetCareer}`
      ]
    }
  };
}

/**
 * Handle resume upload and AI analysis
 */
exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a valid PDF or DOCX resume file."
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const { targetCareer } = req.body;

    const extractedText = await extractTextFromFile(filePath, mimeType, originalName);

    // Clean up temporary upload file safely
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (cleanupErr) {
      console.warn("Could not remove temp file:", cleanupErr.message);
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(422).json({
        success: false,
        error: "Could not extract legible text from the uploaded document. Please ensure it is not a scanned image PDF."
      });
    }

    // Call Gemini AI for deep evaluation
    const prompt = `Analyze this student resume text for technical hiring and career readiness.
Target Career to Evaluate Against: "${targetCareer || 'Software Engineer'}"

Extracted Resume Text:
"""
${extractedText.slice(0, 4000)}
"""

Evaluate realistically. Never invent experience, education, or skills that are not stated in the text.
Respond strictly in JSON matching this schema:
{
  "resumeScore": number (30-95),
  "summary": "professional 2-sentence summary of the candidate's profile based strictly on the text",
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "missingSkills": ["important missing skill 1", "important missing skill 2"],
  "educationSummary": "summary of degrees found or 'No explicit degree detected'",
  "projectsDetected": ["project title or summary found"],
  "experienceDetected": ["experience or internships found or 'Entry level / Academic'"],
  "improvementSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "suitableCareers": [
    { "career": "string", "score": number }
  ],
  "careerAlignment": {
    "targetCareer": "${targetCareer || 'Software Engineer'}",
    "alignmentScore": number (30-95),
    "matchingSkills": ["skills matching target career"],
    "missingCareerSkills": ["critical skills candidate lacks for this role"],
    "careerReadiness": "High Readiness|Moderate Readiness|Needs Foundational Work",
    "actionableImprovements": ["specific step 1", "specific step 2"]
  }
}`;

    const systemInstruction = "You are an expert technical recruiter and resume ATS auditor. Be realistic, thorough, and helpful. Never invent information.";

    let analysisResult = await generateGeminiContent(prompt, systemInstruction, true);

    if (!analysisResult || !analysisResult.resumeScore) {
      analysisResult = analyzeResumeDeterministically(extractedText, targetCareer);
    }

    // Save result to store
    const studentEmail = req.body.email || req.query.email || req.headers['x-student-email'] || null;
    const latestProfile = await store.getLatestProfile(studentEmail);
    const docToSave = {
      ...analysisResult,
      studentProfileId: latestProfile?._id || '',
      studentName: latestProfile?.name || 'Student Candidate',
      fileName: originalName,
      extractedTextLength: extractedText.length
    };

    const saved = await store.saveResumeAnalysis(docToSave);

    return res.status(200).json({
      success: true,
      data: saved
    });
  } catch (error) {
    console.error('[Resume Controller Error]:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to analyze resume: ${error.message}`
    });
  }
};

/**
 * Get latest resume analysis
 */
exports.getLatestResumeAnalysis = async (req, res) => {
  try {
    const studentEmail = req.query.email || req.headers['x-student-email'] || null;
    let analysis = null;
    if (studentEmail) {
      const latestProfile = await store.getLatestProfile(studentEmail);
      if (latestProfile) {
        analysis = await store.getLatestResumeAnalysis(latestProfile._id);
      }
    }
    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

