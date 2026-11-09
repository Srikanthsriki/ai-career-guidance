const { retrieveKnowledge, answerWithRAG } = require('../services/ragService');
const store = require('../models/store');

/**
 * Ask a career question to RAG knowledge base
 */
exports.askKnowledgeBase = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || String(query).trim().length === 0) {
      return res.status(400).json({ success: false, error: "Query is required." });
    }

    const ragResponse = await answerWithRAG(String(query).trim());
    return res.status(200).json({
      success: true,
      data: ragResponse
    });
  } catch (error) {
    console.error('[RAG Query Error]:', error);
    return res.status(500).json({ success: false, error: "Failed to query RAG knowledge base." });
  }
};

/**
 * Browse or search raw documents in the knowledge base
 */
exports.getDocuments = async (req, res) => {
  try {
    const { search } = req.query;
    if (search && search.trim() !== '') {
      const docs = await retrieveKnowledge(search, 10);
      return res.status(200).json({ success: true, count: docs.length, documents: docs });
    }
    const all = await store.getAllKnowledge();
    return res.status(200).json({ success: true, count: all.length, documents: all });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

