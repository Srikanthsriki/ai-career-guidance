const store = require('../models/store');
const { generateGeminiContent } = require('../services/geminiService');

/**
 * Validate student profile semantically using Gemini AI or strict heuristic validation
 */
exports.validateAndSaveProfile = async (req, res) => {
  try {
    const { name, education, skills, interests, programmingKnowledge, experience, preferredCareer, email } = req.body;
    const studentEmail = email || req.headers['x-student-email'] || null;

    // Basic required fields check
    if (!name || !education || !programmingKnowledge) {
      return res.status(400).json({
        success: false,
        error: "Name, Education, and Programming Knowledge are required fields."
      });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : String(skills || '').split(',').map(s => s.trim()).filter(Boolean);

    const interestsArray = Array.isArray(interests)
      ? interests
      : String(interests || '').split(',').map(s => s.trim()).filter(Boolean);

    // AI Semantic Validation
    let isMeaningful = true;
    let feedback = [];

    // Semantic checks
    if (programmingKnowledge.trim().length < 4 || ['yes', 'no', 'ok', 'good', 'nothing'].includes(programmingKnowledge.trim().toLowerCase())) {
      isMeaningful = false;
      feedback.push("Please elaborate on your programming knowledge. Specify languages (e.g. Python, Java, C++, JavaScript) or frameworks you are familiar with.");
    }

    if (skillsArray.length === 0) {
      isMeaningful = false;
      feedback.push("Please provide at least 1 or 2 specific technical or foundational skills you currently possess.");
    }

    if (education.trim().length < 3) {
      isMeaningful = false;
      feedback.push("Please provide a clearer education background (e.g., 'B.Tech in Computer Science 3rd Year' or 'BCA Final Year').");
    }

    // Call Gemini for advanced semantic check if configured
    const prompt = `Assess the following student profile input for clarity, sufficiency, and relevance for a career guidance system.
Profile:
- Name: "${name}"
- Education: "${education}"
- Skills: "${skillsArray.join(', ')}"
- Interests: "${interestsArray.join(', ')}"
- Programming Knowledge: "${programmingKnowledge}"
- Experience: "${experience || 'Beginner'}"
- Preferred Career: "${preferredCareer || 'Undecided'}"

Evaluate if the response has gibberish, filler words, or lacks meaningful information.
Return JSON with:
{
  "isValid": boolean,
  "reasons": ["string feedback if incomplete or vague"],
  "missingInformation": ["skills", "education", etc if any]
}`;

    const aiValidation = await generateGeminiContent(prompt, "You are a strict academic admission and career counseling validator. Never invent student details.", true);

    if (aiValidation && typeof aiValidation === 'object' && aiValidation.isValid === false) {
      isMeaningful = false;
      if (Array.isArray(aiValidation.reasons)) {
        feedback = [...new Set([...feedback, ...aiValidation.reasons])];
      }
    }

    if (!isMeaningful) {
      return res.status(422).json({
        success: false,
        semanticValidationError: true,
        message: "Your profile details require additional clarity before we can generate an accurate career recommendation.",
        feedback
      });
    }

    // Save profile to database
    const profileDoc = await store.saveProfile({
      email: studentEmail ? String(studentEmail).trim().toLowerCase() : null,
      name: name.trim(),
      education: education.trim(),
      skills: skillsArray,
      interests: interestsArray,
      programmingKnowledge: programmingKnowledge.trim(),
      experience: experience || 'Beginner',
      preferredCareer: (preferredCareer || '').trim(),
      validationNotes: "Profile passed semantic and syntactic verification.",
      isAiValidated: true
    });

    return res.status(201).json({
      success: true,
      message: "Student profile validated and stored successfully.",
      profile: profileDoc
    });
  } catch (error) {
    console.error('[Profile Controller Error]:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while processing student profile."
    });
  }
};

/**
 * Get latest student profile
 */
exports.getLatestProfile = async (req, res) => {
  try {
    const studentEmail = req.query.email || req.headers['x-student-email'] || null;
    const profile = await store.getLatestProfile(studentEmail);
    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

