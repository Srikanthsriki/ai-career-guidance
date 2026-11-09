const store = require('../models/store');
const { generateGeminiContent } = require('../services/geminiService');
const { MCP_TOOL_DEFINITIONS, executeMcpTool } = require('../services/mcpTools');

/**
 * APEX - Intelligent AI Career Guidance Chat Bot Engine
 */
exports.chatWithAgent = async (req, res) => {
  try {
    const { message, chatHistory, email } = req.body;
    if (!message || String(message).trim().length === 0) {
      return res.status(400).json({ success: false, error: "Message cannot be empty." });
    }

    const cleanMessage = String(message).trim();
    const studentEmail = email || req.query.email || req.headers['x-student-email'] || null;

    // Fetch student context if available
    const profile = await store.getLatestProfile(studentEmail);
    const recommendation = await store.getLatestRecommendation(profile?._id);
    const resumeAnalysis = await store.getLatestResumeAnalysis(profile?._id);
    const progress = await store.getProgress(recommendation?.bestFitCareer || 'Full Stack Web Developer', profile?._id);

    const studentContext = {
      profileId: profile?._id || '',
      name: profile?.name || 'Student',
      education: profile?.education || 'College Student',
      skills: profile?.skills || [],
      preferredCareer: profile?.preferredCareer || '',
      bestFitCareer: recommendation?.bestFitCareer || 'Software & Tech Careers',
      matchScore: recommendation?.matchScore || null,
      resumeScore: resumeAnalysis?.resumeScore || null,
      progressPercent: progress?.overallProgressPercent || 0
    };

    // System Persona for APEX
    const systemInstruction = `You are APEX, an elite, friendly, and encouraging AI Career Guidance Advisor designed to help students discover and master their ideal career path.

Student Context:
- Student Name: ${studentContext.name}
- Education: ${studentContext.education}
- Current Skills: ${studentContext.skills.length > 0 ? studentContext.skills.join(', ') : 'Not yet specified'}
- Recommended Career: ${studentContext.bestFitCareer} ${studentContext.matchScore ? `(Match Score: ${studentContext.matchScore}%)` : ''}
- Learning Progress: ${studentContext.progressPercent}%

Guidelines for APEX:
1. Always introduce or carry yourself as "APEX" — smart, approachable, direct, and actionable.
2. Answer ANY question related to AI career guidance, technology stacks, learning roadmaps, skills gap, resume building, interview preparation, portfolio projects, salary trends, or industry opportunities.
3. Structure your answers cleanly using Markdown: use bold headings, bullet points, and code/tech highlights.
4. Keep advice practical, realistic, and inspiring for students entering the modern workforce.
5. If the user asks about their own profile, reference their details naturally.`;

    const recentHistoryText = Array.isArray(chatHistory)
      ? chatHistory.slice(-5).map(h => `${h.role === 'user' ? 'Student' : 'APEX'}: ${h.content}`).join('\n')
      : '';

    const prompt = `${recentHistoryText ? `Recent Conversation:\n${recentHistoryText}\n\n` : ''}Student: ${cleanMessage}\n\nAPEX Response:`;

    let reply = await generateGeminiContent(prompt, systemInstruction, false);

    // High-Fidelity Domain Response Fallback for APEX
    if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
      const lower = cleanMessage.toLowerCase();
      const sName = studentContext.name;
      const targetCareer = studentContext.bestFitCareer;

      if (lower.includes('skill') || lower.includes('learn') || lower.includes('start')) {
        reply = `Hello **${sName}**! I'm **APEX**, your AI Career Advisor.\n\nTo excel in **${targetCareer}**, focus on these high-demand core competencies:\n\n1. **Core Technical Foundations:** Master modern programming fundamentals (JavaScript/TypeScript or Python), Data Structures, and Version Control with Git.\n2. **Applied Frameworks & Tools:** Build full-lifecycle applications using industry-standard frameworks.\n3. **Database Architecture:** Learn both SQL (PostgreSQL/MySQL) and NoSQL (MongoDB) schemas.\n4. **System Architecture:** Understand RESTful APIs, cloud deployment (Docker/AWS), and automated testing.\n\nWould you like me to tailor a week-by-week study plan for your current skill level?`;
      } else if (lower.includes('interview') || lower.includes('question') || lower.includes('prepare')) {
        reply = `Hi **${sName}**! **APEX** interview preparation checklist for **${targetCareer}**:\n\n- **Technical Mastery:** Review fundamental algorithmic problem solving (Arrays, Hash Maps, Trees) and system design principles.\n- **Behavioral (STAR Method):** Prepare stories highlighting Situation, Task, Action, and Result for teamwork and conflict scenarios.\n- **Live Coding Practice:** Explain your thought process out loud before typing code.\n\nYou can also launch our interactive **AI Interview Simulator** in the sidebar to run a live practice interview session with instant feedback!`;
      } else if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) {
        reply = `Hello **${sName}**! Here is **APEX's** formula for a top-tier tech resume:\n\n1. **Quantifiable Bullet Points:** Use the Google formula: *"Accomplished [X], as measured by [Y], by doing [Z]"*.\n2. **Clean Single-Column Layout:** Ensure ATS friendliness with standard headings (Education, Skills, Experience, Projects).\n3. **Live Project Links:** Provide GitHub repositories and live deployed application URLs.\n\nUse our **AI Resume Analyzer** tab to upload your resume PDF and receive instant ATS scoring against your target career!`;
      } else if (lower.includes('salary') || lower.includes('money') || lower.includes('market') || lower.includes('scope')) {
        reply = `Hi **${sName}**! The industry outlook for **${targetCareer}** is very robust in 2026:\n\n- **Entry-Level (Junior):** Highly competitive, with compensation averaging competitive packages across product startups and IT leaders.\n- **Mid-Level (2-4 yrs):** Rapid growth as you demonstrate ownership of scalable systems and cloud deployments.\n- **Growth Sectors:** SaaS platforms, Cloud Computing, AI-powered automation, and enterprise microservices.\n\nBuilding verifiable real-world projects is the single highest leverage activity to command higher compensation.`;
      } else {
        reply = `Hello **${sName}**! I am **APEX**, your personal AI Career Advisor.\n\nI can assist you with:\n- 🎯 **Career Path Exploration:** Discovering best-fit engineering & tech roles.\n- 🗺️ **Personalized Roadmaps:** Step-by-step learning schedules from beginner to advanced.\n- 💡 **Skill Gap Solutions:** Specific courses, topics, and practical exercises.\n- 📄 **Resume & Portfolio Advice:** How to stand out to hiring managers.\n- 🎤 **Interview Coaching:** Technical questions, system design, and behavioral tips.\n\nWhat career goal would you like to explore today?`;
      }
    }

    return res.status(200).json({
      success: true,
      botName: 'APEX',
      reply,
      toolExecution: null
    });
  } catch (error) {
    console.error('[APEX Chat Error]:', error);
    return res.status(500).json({ success: false, error: "Failed to communicate with APEX AI." });
  }
};

/**
 * Get available tools
 */
exports.getMcpToolsCatalog = (req, res) => {
  return res.status(200).json({
    success: true,
    protocol: "APEX AI Engine",
    tools: MCP_TOOL_DEFINITIONS
  });
};
