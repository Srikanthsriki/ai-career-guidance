const store = require('../models/store');
const { generateGeminiContent } = require('../services/geminiService');

// Fallback question bank by career and category
const DEFAULT_QUESTION_BANK = {
  "Full Stack Web Developer": [
    {
      id: "fs-1",
      questionText: "Explain the difference between synchronous and asynchronous operations in Node.js. How does the event loop handle asynchronous I/O?",
      category: "Technical",
      difficulty: "Intermediate"
    },
    {
      id: "fs-2",
      questionText: "How do you manage state in a complex React application? When would you choose the Context API over an external state management library like Redux or Zustand?",
      category: "Technical",
      difficulty: "Intermediate"
    },
    {
      id: "fs-3",
      questionText: "Describe a scenario where a database query was causing high latency in your web application. How would you diagnose, index, and optimize it?",
      category: "Practical Problems",
      difficulty: "Intermediate"
    },
    {
      id: "fs-4",
      questionText: "Tell me about a time you had a technical disagreement with a team member regarding an architectural decision. How did you resolve it?",
      category: "Behavioral",
      difficulty: "Beginner"
    }
  ],
  "AI & Machine Learning Engineer": [
    {
      id: "ai-1",
      questionText: "What is the difference between precision, recall, and F1-score? In a fraud detection model, which metric would you optimize for and why?",
      category: "Technical",
      difficulty: "Intermediate"
    },
    {
      id: "ai-2",
      questionText: "Explain the architectural differences between standard cross-entropy training and fine-tuning an LLM using Low-Rank Adaptation (LoRA).",
      category: "Technical",
      difficulty: "Advanced"
    },
    {
      id: "ai-3",
      questionText: "Your RAG pipeline is generating hallucinated answers despite having relevant knowledge documents. How do you diagnose chunking, vector similarity, and temperature settings to fix it?",
      category: "Practical Problems",
      difficulty: "Advanced"
    },
    {
      id: "ai-4",
      questionText: "Describe a project where your initial model failed to generalize well to test data. What concrete steps did you take to prevent overfitting?",
      category: "Scenario-based",
      difficulty: "Intermediate"
    }
  ]
};

/**
 * Start a new interview session and generate tailored questions
 */
exports.startInterviewSession = async (req, res) => {
  try {
    const { career, difficulty, categories } = req.body;
    const targetCareer = career || "Full Stack Web Developer";
    const selectedDifficulty = difficulty || "Intermediate";
    const selectedCategories = Array.isArray(categories) && categories.length > 0 ? categories : ["Technical", "Behavioral"];

    const prompt = `Generate 4 realistic technical and behavioral interview questions for a candidate interviewing for the role of "${targetCareer}".
Difficulty: "${selectedDifficulty}".
Categories to cover: ${selectedCategories.join(', ')}.

Respond strictly with a JSON object:
{
  "questions": [
    {
      "id": "q1",
      "questionText": "clear interview question text",
      "category": "Technical|Behavioral|Practical Problems|Scenario-based",
      "difficulty": "${selectedDifficulty}"
    }
  ]
}`;

    const systemInstruction = "You are a senior tech lead conducting an engineering hiring interview. Craft thoughtful, realistic questions.";
    let generated = await generateGeminiContent(prompt, systemInstruction, true);

    let questions = [];
    if (generated && Array.isArray(generated.questions) && generated.questions.length > 0) {
      questions = generated.questions.map((q, idx) => ({
        questionId: q.id || `q-${idx + 1}`,
        questionText: q.questionText,
        category: q.category || 'Technical',
        difficulty: q.difficulty || selectedDifficulty,
        studentAnswer: '',
        score: 0,
        relevance: 0,
        technicalAccuracy: 0,
        clarity: 0,
        problemSolving: 0,
        communication: 0,
        strengths: [],
        areasForImprovement: [],
        suggestedAnswerApproach: ''
      }));
    } else {
      const fallbackList = DEFAULT_QUESTION_BANK[targetCareer] || DEFAULT_QUESTION_BANK["Full Stack Web Developer"];
      questions = fallbackList.map((q, idx) => ({
        questionId: q.id || `q-${idx + 1}`,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
        studentAnswer: '',
        score: 0,
        relevance: 0,
        technicalAccuracy: 0,
        clarity: 0,
        problemSolving: 0,
        communication: 0,
        strengths: [],
        areasForImprovement: [],
        suggestedAnswerApproach: ''
      }));
    }

    const latestProfile = await store.getLatestProfile(req.query.email || req.body?.email || req.headers['x-student-email'] || null);

    const session = await store.createInterviewSession({
      studentProfileId: latestProfile?._id || '',
      studentName: latestProfile?.name || 'Candidate',
      career: targetCareer,
      difficulty: selectedDifficulty,
      categories: selectedCategories,
      status: 'in_progress',
      questions,
      overallScore: 0,
      performanceRating: 'In Progress'
    });

    return res.status(201).json({
      success: true,
      sessionId: session._id,
      session
    });
  } catch (error) {
    console.error('[Interview Controller Error]:', error);
    return res.status(500).json({ success: false, error: "Failed to initialize interview session." });
  }
};

/**
 * Submit answer for a specific question and evaluate it
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionId, studentAnswer } = req.body;

    if (!sessionId || !questionId) {
      return res.status(400).json({ success: false, error: "sessionId and questionId are required." });
    }

    const session = await store.getInterviewSession(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: "Interview session not found." });
    }

    const questionObj = session.questions.find(q => q.questionId === questionId || q._id?.toString() === questionId);
    if (!questionObj) {
      return res.status(404).json({ success: false, error: "Question not found in this session." });
    }

    const cleanAnswer = String(studentAnswer || '').trim();

    // AI Evaluation
    const prompt = `Evaluate the student's answer to this interview question for the role of ${session.career}.
Question: "${questionObj.questionText}"
Question Category: "${questionObj.category}"
Student's Answer: "${cleanAnswer}"

Provide a constructive, realistic evaluation scoring from 0 to 100 for each dimension.
Respond strictly in JSON:
{
  "score": number (0-100 overall score for this answer),
  "relevance": number (0-100),
  "technicalAccuracy": number (0-100),
  "clarity": number (0-100),
  "problemSolving": number (0-100),
  "communication": number (0-100),
  "strengths": ["string highlight 1", "string highlight 2"],
  "areasForImprovement": ["string constructive criticism 1"],
  "suggestedAnswerApproach": "A concise, model answer framework demonstrating how an experienced engineer would answer this question clearly."
}`;

    let evalResult = await generateGeminiContent(prompt, "You are a fair, expert technical interviewer. Score objectively based on answer depth and clarity.", true);

    if (!evalResult || !evalResult.score) {
      // Deterministic evaluation fallback
      const wordCount = cleanAnswer.split(/\s+/).length;
      let score = 50;
      if (wordCount > 30) score += 20;
      if (wordCount > 70) score += 15;
      if (cleanAnswer.length < 15) score = 30;

      evalResult = {
        score: Math.min(95, score),
        relevance: Math.min(90, score + 2),
        technicalAccuracy: Math.min(92, score - 3),
        clarity: Math.min(95, score + 4),
        problemSolving: Math.min(88, score),
        communication: Math.min(95, score + 5),
        strengths: ["Clear terminology used", "Demonstrated direct awareness of the question core"],
        areasForImprovement: ["Provide a concrete real-world project example", "Structure your answer using the STAR technique (Situation, Task, Action, Result)"],
        suggestedAnswerApproach: `Begin by defining the core principle directly. Then contrast the trade-offs involved, and conclude with a quick example from your hands-on project experience.`
      };
    }

    // Update question in session
    questionObj.studentAnswer = cleanAnswer;
    questionObj.score = evalResult.score;
    questionObj.relevance = evalResult.relevance;
    questionObj.technicalAccuracy = evalResult.technicalAccuracy;
    questionObj.clarity = evalResult.clarity;
    questionObj.problemSolving = evalResult.problemSolving;
    questionObj.communication = evalResult.communication;
    questionObj.strengths = evalResult.strengths || [];
    questionObj.areasForImprovement = evalResult.areasForImprovement || [];
    questionObj.suggestedAnswerApproach = evalResult.suggestedAnswerApproach || '';

    // Calculate updated overall session metrics
    const answered = session.questions.filter(q => q.studentAnswer && q.studentAnswer.trim() !== '');
    const avgScore = Math.round(answered.reduce((sum, q) => sum + (q.score || 0), 0) / (answered.length || 1));
    session.overallScore = avgScore;

    if (answered.length === session.questions.length) {
      session.status = 'completed';
      session.completedAt = new Date();
      if (avgScore >= 85) session.performanceRating = 'Excellent';
      else if (avgScore >= 70) session.performanceRating = 'Proficient';
      else if (avgScore >= 55) session.performanceRating = 'Developing';
      else session.performanceRating = 'Needs Practice';

      session.finalReport = {
        summary: `Completed all ${session.questions.length} interview questions with an overall score of ${avgScore}%. Demonstrated solid aptitude with clear opportunities to refine communication clarity and depth.`,
        overallStrengths: ["Consistent participation across technical and behavioral categories", "Good grasp of core foundational concepts"],
        keyActionItems: ["Adopt the STAR method for behavioral answers", "Deepen technical vocabulary when describing system architecture"]
      };
    }

    const updated = await store.updateInterviewSession(sessionId, session);

    return res.status(200).json({
      success: true,
      evaluation: evalResult,
      session: updated
    });
  } catch (error) {
    console.error('[Interview Submit Error]:', error);
    return res.status(500).json({ success: false, error: "Failed to evaluate answer." });
  }
};

/**
 * Get interview session details or all past sessions
 */
exports.getSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const session = await store.getInterviewSession(id);
      return res.status(200).json({ success: true, session });
    }
    const studentEmail = req.query.email || req.headers['x-student-email'] || null;
    const profile = await store.getLatestProfile(studentEmail);
    const allSessions = await store.getAllInterviewSessions(profile?._id);
    return res.status(200).json({ success: true, sessions: allSessions });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

