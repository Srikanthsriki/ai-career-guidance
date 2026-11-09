// Model Context Protocol (MCP) Tools Registry and Execution Engine
const { retrieveKnowledge } = require('./ragService');
const { verifiedLearningResources, verifiedJobOpportunities } = require('../data/defaultKnowledge');
const store = require('../models/store');

// Approved MCP Tool Definitions following the standard Model Context Protocol schema
const MCP_TOOL_DEFINITIONS = [
  {
    name: "search_career_knowledge",
    description: "Search the verified career RAG knowledge base for authoritative guides, curriculum standards, and technical skill expectations.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keyword or question about a career track, skill, or industry practice."
        },
        limit: {
          type: "number",
          description: "Maximum number of results to retrieve (default: 3)."
        }
      },
      required: ["query"]
    }
  },
  {
    name: "search_learning_resources",
    description: "Look up verified external learning resources, documentation, courses, and practice platforms by career and skill.",
    inputSchema: {
      type: "object",
      properties: {
        career: {
          type: "string",
          description: "Career track name (e.g., 'Full Stack Web Development', 'AI & Machine Learning Engineer')."
        },
        skill: {
          type: "string",
          description: "Optional specific skill name (e.g., 'React', 'Python', 'Docker')."
        }
      }
    }
  },
  {
    name: "get_roadmap_progress",
    description: "Retrieve the student's current learning roadmap completion percentage and completed milestones.",
    inputSchema: {
      type: "object",
      properties: {
        career: {
          type: "string",
          description: "Career title to check progress for."
        }
      },
      required: ["career"]
    }
  },
  {
    name: "update_progress_task",
    description: "Mark a milestone or learning task as completed in the student's roadmap progress tracker.",
    inputSchema: {
      type: "object",
      properties: {
        career: {
          type: "string",
          description: "Career title"
        },
        taskId: {
          type: "string",
          description: "Unique ID of the task or milestone completed."
        },
        taskTitle: {
          type: "string",
          description: "Title of the completed task."
        }
      },
      required: ["career", "taskId", "taskTitle"]
    }
  },
  {
    name: "get_latest_career_profile",
    description: "Retrieve the student's validated profile, recommended career, and current match score.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

/**
 * MCP Tool Executor with validation and security safeguards
 */
async function executeMcpTool(toolName, parameters = {}, studentContext = {}) {
  try {
    switch (toolName) {
      case "search_career_knowledge": {
        const query = String(parameters.query || '').trim();
        if (!query) {
          return { error: "Query parameter cannot be empty." };
        }
        const limit = Math.min(5, Math.max(1, Number(parameters.limit) || 3));
        const docs = await retrieveKnowledge(query, limit);
        return {
          tool: "search_career_knowledge",
          status: "success",
          resultCount: docs.length,
          documents: docs.map(d => ({
            title: d.title,
            category: d.category,
            source: d.sourceName,
            url: d.sourceUrl,
            summary: d.summary
          }))
        };
      }

      case "search_learning_resources": {
        const careerFilter = (parameters.career || '').toLowerCase();
        const skillFilter = (parameters.skill || '').toLowerCase();

        let filtered = verifiedLearningResources;
        if (careerFilter) {
          filtered = filtered.filter(r => r.career.toLowerCase().includes(careerFilter));
        }
        if (skillFilter) {
          filtered = filtered.filter(r => r.skill.toLowerCase().includes(skillFilter));
        }

        return {
          tool: "search_learning_resources",
          status: "success",
          count: filtered.length,
          resources: filtered.slice(0, 6).map(r => ({
            title: r.title,
            provider: r.provider,
            type: r.type,
            skill: r.skill,
            url: r.url,
            isFree: r.isFree
          }))
        };
      }

      case "get_roadmap_progress": {
        const career = parameters.career || studentContext.preferredCareer || 'Full Stack Web Development';
        const progressDoc = await store.getProgress(career, studentContext.profileId);
        return {
          tool: "get_roadmap_progress",
          status: "success",
          career,
          overallProgressPercent: progressDoc ? progressDoc.overallProgressPercent : 0,
          completedMilestonesCount: progressDoc ? progressDoc.completedMilestones.length : 0,
          completedMilestones: progressDoc ? progressDoc.completedMilestones : []
        };
      }

      case "update_progress_task": {
        const career = parameters.career || 'Full Stack Web Development';
        const taskId = String(parameters.taskId);
        const taskTitle = String(parameters.taskTitle);

        let existing = await store.getProgress(career, studentContext.profileId);
        if (!existing) {
          existing = {
            career,
            studentProfileId: studentContext.profileId || '',
            completedMilestones: [taskTitle],
            completedTasks: [{ taskId, taskTitle, completed: true, completedAt: new Date() }],
            overallProgressPercent: 10
          };
        } else {
          if (!existing.completedMilestones.includes(taskTitle)) {
            existing.completedMilestones.push(taskTitle);
          }
          const taskObj = existing.completedTasks?.find(t => t.taskId === taskId);
          if (taskObj) {
            taskObj.completed = true;
            taskObj.completedAt = new Date();
          } else {
            existing.completedTasks = existing.completedTasks || [];
            existing.completedTasks.push({ taskId, taskTitle, completed: true, completedAt: new Date() });
          }
          existing.overallProgressPercent = Math.min(100, (existing.completedMilestones.length * 15));
        }

        const saved = await store.saveProgress(existing);
        return {
          tool: "update_progress_task",
          status: "success",
          message: `Task "${taskTitle}" marked as complete!`,
          newProgressPercent: saved.overallProgressPercent
        };
      }

      case "get_latest_career_profile": {
        const profile = await store.getLatestProfile();
        const recommendation = await store.getLatestRecommendation(profile?._id);
        return {
          tool: "get_latest_career_profile",
          status: "success",
          studentName: profile?.name || 'Guest Student',
          education: profile?.education || 'Not provided',
          skills: profile?.skills || [],
          bestFitCareer: recommendation?.bestFitCareer || 'Full Stack Web Development',
          matchScore: recommendation?.matchScore || 85
        };
      }

      default:
        return {
          error: `Tool "${toolName}" is not recognized or not authorized in the MCP server.`
        };
    }
  } catch (err) {
    return {
      error: `Tool execution error: ${err.message}`
    };
  }
}

module.exports = {
  MCP_TOOL_DEFINITIONS,
  executeMcpTool
};

