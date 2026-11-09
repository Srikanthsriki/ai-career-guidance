import axios from 'axios';

// Locally, Vite forwards /api to the backend on port 5000.
// On Vercel, set VITE_API_URL to your Render backend URL (e.g. https://your-app.onrender.com).
const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_ROOT ? `${API_ROOT}/api` : '/api',
  timeout: 60000, // Render free servers can take ~50s to wake up
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-attach logged in student's Gmail to all requests
api.interceptors.request.use((config) => {
  try {
    const userStr = localStorage.getItem('student_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.email) {
        config.headers['x-student-email'] = user.email;
        if (!config.params) config.params = {};
        if (!config.params.email) {
          config.params.email = user.email;
        }
        if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
          if (!config.data.email) {
            config.data.email = user.email;
          }
        }
      }
    }
  } catch (e) {
    console.error('API Interceptor notice:', e);
  }
  return config;
});

// Profile APIs
export const validateAndSaveProfile = async (profileData) => {
  const res = await api.post('/profile/validate-save', profileData);
  return res.data;
};

export const getLatestProfile = async () => {
  const res = await api.get('/profile/latest');
  return res.data;
};

// Career Recommendation APIs
export const generateRecommendation = async () => {
  const res = await api.post('/career/recommend');
  return res.data;
};

export const getLatestRecommendation = async () => {
  const res = await api.get('/career/latest');
  return res.data;
};

export const compareCareers = async (careers) => {
  const res = await api.post('/career/compare', { careers });
  return res.data;
};

// Resume APIs
export const uploadAndAnalyzeResume = async (formData) => {
  const res = await api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getLatestResumeAnalysis = async () => {
  const res = await api.get('/resume/latest');
  return res.data;
};

// Interview APIs
export const startInterview = async (career, difficulty, categories) => {
  const res = await api.post('/interview/start', { career, difficulty, categories });
  return res.data;
};

export const submitInterviewAnswer = async (sessionId, questionId, studentAnswer) => {
  const res = await api.post('/interview/submit-answer', { sessionId, questionId, studentAnswer });
  return res.data;
};

export const getInterviewSession = async (id) => {
  const res = await api.get(`/interview/session/${id}`);
  return res.data;
};

export const getInterviewHistory = async () => {
  const res = await api.get('/interview/history');
  return res.data;
};

// Progress APIs
export const getProgress = async (career) => {
  const res = await api.get(`/progress?career=${encodeURIComponent(career || '')}`);
  return res.data;
};

export const updateProgressTask = async (data) => {
  const res = await api.post('/progress/task', data);
  return res.data;
};

// RAG Knowledge Base APIs
export const queryRAGKnowledge = async (query) => {
  const res = await api.post('/rag/query', { query });
  return res.data;
};

export const getKnowledgeDocuments = async (search = '') => {
  const res = await api.get(`/rag/documents?search=${encodeURIComponent(search)}`);
  return res.data;
};

// AI Career Agent & MCP APIs
export const chatWithAgent = async (message, chatHistory = []) => {
  const res = await api.post('/agent/chat', { message, chatHistory });
  return res.data;
};

export const getMcpCatalog = async () => {
  const res = await api.get('/agent/mcp-tools');
  return res.data;
};

// Resources & Jobs APIs
export const getLearningResources = async (params = {}) => {
  const res = await api.get('/resources/learning', { params });
  return res.data;
};

export const getJobOpportunities = async (params = {}) => {
  const res = await api.get('/resources/jobs', { params });
  return res.data;
};

// Analytics & Alignment APIs
export const getAnalyticsSummary = async () => {
  const res = await api.get('/analytics/summary');
  return res.data;
};

export const getCareerAlignment = async () => {
  const res = await api.get('/analytics/alignment');
  return res.data;
};

export const checkHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

// Database Engine APIs
export const getDatabaseStatus = async () => {
  const res = await api.get('/database/status');
  return res.data;
};

export const seedDatabase = async () => {
  const res = await api.post('/database/seed');
  return res.data;
};

export const exportDatabase = async () => {
  const res = await api.get('/database/export');
  return res.data;
};

// Authentication APIs
export const registerUser = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export default api;

