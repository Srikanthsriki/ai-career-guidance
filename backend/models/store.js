// Unified store: delegates to Mongoose when connected, or to our custom persistent FileDB
const { isDbConnected } = require('../config/db');
const db = require('../database/dbEngine');
const StudentProfile = require('./StudentProfile');
const CareerRecommendation = require('./CareerRecommendation');
const ResumeAnalysis = require('./ResumeAnalysis');
const InterviewSession = require('./InterviewSession');
const Progress = require('./Progress');
const KnowledgeDocument = require('./KnowledgeDocument');

const store = {
  // Profiles
  async saveProfile(data) {
    const cleanEmail = data.email ? String(data.email).trim().toLowerCase() : null;
    if (isDbConnected()) {
      if (cleanEmail) {
        const existing = await StudentProfile.findOne({ email: cleanEmail });
        if (existing) {
          Object.assign(existing, data);
          existing.updatedAt = new Date();
          return await existing.save();
        }
      }
      if (data._id) {
        return await StudentProfile.findByIdAndUpdate(data._id, data, { new: true });
      }
      return await StudentProfile.create(data);
    }
    // FileDB
    if (cleanEmail) {
      const existing = db.findOne('profiles', p => p.email === cleanEmail);
      if (existing) {
        return db.updateById('profiles', existing._id, { ...data, updatedAt: new Date().toISOString() });
      }
    }
    if (data._id) {
      return db.updateById('profiles', data._id, data);
    }
    return db.insert('profiles', data);
  },

  async getLatestProfile(email = null) {
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    if (isDbConnected()) {
      if (cleanEmail) {
        return await StudentProfile.findOne({ email: cleanEmail }).sort({ updatedAt: -1, createdAt: -1 });
      }
      return null;
    }
    const all = db.find('profiles');
    if (cleanEmail) {
      const userProfiles = all.filter(p => p.email && p.email.toLowerCase() === cleanEmail);
      return userProfiles.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0] || null;
    }
    return null;
  },

  async getProfileById(id) {
    if (isDbConnected()) {
      return await StudentProfile.findById(id);
    }
    return db.findById('profiles', id);
  },

  // Career Recommendation
  async saveRecommendation(data) {
    if (isDbConnected()) {
      return await CareerRecommendation.create(data);
    }
    return db.insert('recommendations', data);
  },

  // Per-student data is only returned for a known profile, so one student never sees another's results.
  async getLatestRecommendation(profileId = null) {
    if (!profileId) return null;
    const pid = String(profileId);
    if (isDbConnected()) {
      return await CareerRecommendation.findOne({ studentProfileId: pid }).sort({ createdAt: -1 });
    }
    const filtered = db.find('recommendations', r => String(r.studentProfileId) === pid);
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
  },

  async getAllRecommendations() {
    if (isDbConnected()) {
      return await CareerRecommendation.find().sort({ createdAt: -1 });
    }
    return db.find('recommendations').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Resume Analysis
  async saveResumeAnalysis(data) {
    if (isDbConnected()) {
      return await ResumeAnalysis.create(data);
    }
    return db.insert('resumes', data);
  },

  async getLatestResumeAnalysis(profileId = null) {
    if (!profileId) return null;
    const pid = String(profileId);
    if (isDbConnected()) {
      return await ResumeAnalysis.findOne({ studentProfileId: pid }).sort({ createdAt: -1 });
    }
    const filtered = db.find('resumes', r => String(r.studentProfileId) === pid);
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
  },

  // Interview Sessions
  async createInterviewSession(data) {
    if (isDbConnected()) {
      return await InterviewSession.create(data);
    }
    return db.insert('interviews', data);
  },

  async getInterviewSession(id) {
    if (isDbConnected()) {
      return await InterviewSession.findById(id);
    }
    return db.findById('interviews', id);
  },

  async updateInterviewSession(id, updateData) {
    if (isDbConnected()) {
      return await InterviewSession.findByIdAndUpdate(id, updateData, { new: true });
    }
    return db.updateById('interviews', id, updateData);
  },

  async getAllInterviewSessions(profileId = null) {
    if (!profileId) return [];
    const pid = String(profileId);
    if (isDbConnected()) {
      return await InterviewSession.find({ studentProfileId: pid }).sort({ createdAt: -1 });
    }
    return db
      .find('interviews', s => String(s.studentProfileId) === pid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Progress
  async getProgress(career, profileId = null) {
    if (!profileId) return null;
    const pid = String(profileId);
    if (isDbConnected()) {
      return await Progress.findOne({ career, studentProfileId: pid });
    }
    return db.findOne('progress', p => p.career === career && String(p.studentProfileId) === pid);
  },

  async saveProgress(data) {
    if (!data.studentProfileId) return data; // Not saved without a student profile
    const pid = String(data.studentProfileId);
    const doc = typeof data.toObject === 'function' ? data.toObject() : { ...data };
    delete doc._id;
    doc.studentProfileId = pid;
    if (isDbConnected()) {
      return await Progress.findOneAndUpdate(
        { career: doc.career, studentProfileId: pid },
        doc,
        { upsert: true, new: true }
      );
    }
    return db.upsert(
      'progress',
      p => p.career === doc.career && String(p.studentProfileId) === pid,
      doc
    );
  },

  // Knowledge Documents
  async getAllKnowledge() {
    if (isDbConnected()) {
      return await KnowledgeDocument.find();
    }
    return db.find('knowledge');
  },

  async saveKnowledgeDocument(data) {
    if (isDbConnected()) {
      return await KnowledgeDocument.create(data);
    }
    return db.insert('knowledge', data);
  },

  async seedKnowledgeIfEmpty(docs) {
    const existing = await this.getAllKnowledge();
    if (!existing || existing.length === 0) {
      for (const d of docs) {
        await this.saveKnowledgeDocument(d);
      }
    }
  }
};

module.exports = store;
