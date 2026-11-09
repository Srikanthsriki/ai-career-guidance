// RAG (Retrieval-Augmented Generation) Service
const store = require('../models/store');
const { defaultKnowledgeDocuments } = require('../data/defaultKnowledge');
const { generateGeminiContent } = require('./geminiService');

// Seed knowledge base on startup
async function initKnowledgeBase() {
  await store.seedKnowledgeIfEmpty(defaultKnowledgeDocuments);
}

// Simple deterministic vectorizer for local semantic search fallback
function computeTextTokens(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function calculateSimilarity(query, docText) {
  const queryTokens = new Set(computeTextTokens(query));
  const docTokens = computeTextTokens(docText);
  if (queryTokens.size === 0 || docTokens.length === 0) return 0;

  let matches = 0;
  for (const token of docTokens) {
    if (queryTokens.has(token)) {
      matches++;
    }
  }

  // Jaccard + Term overlap score
  const uniqueDocTokens = new Set(docTokens);
  let intersection = 0;
  for (const t of queryTokens) {
    if (uniqueDocTokens.has(t)) intersection++;
  }
  const jaccard = intersection / (queryTokens.size + uniqueDocTokens.size - intersection);
  const termDensity = Math.min(1, matches / (queryTokens.size * 3));

  return parseFloat((jaccard * 0.6 + termDensity * 0.4).toFixed(3));
}

/**
 * Retrieve top relevant documents from knowledge base
 */
async function retrieveKnowledge(query, limit = 3) {
  await initKnowledgeBase();
  const allDocs = await store.getAllKnowledge();

  const scored = allDocs.map(doc => {
    const fullText = `${doc.title} ${doc.careerCategory} ${(doc.tags || []).join(' ')} ${doc.summary} ${doc.content}`;
    const score = calculateSimilarity(query, fullText);
    return {
      doc,
      score
    };
  });

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  const topResults = scored.slice(0, limit).filter(item => item.score > 0.05);

  return topResults.map(item => ({
    id: item.doc._id,
    title: item.doc.title,
    category: item.doc.careerCategory,
    summary: item.doc.summary,
    content: item.doc.content,
    sourceName: item.doc.sourceName,
    sourceUrl: item.doc.sourceUrl,
    relevanceScore: Math.min(98, Math.round(item.score * 100) + 15) // mapped to percentage
  }));
}

/**
 * Generate an answer to a career question grounded ONLY in retrieved documents
 */
async function answerWithRAG(query) {
  const retrievedDocs = await retrieveKnowledge(query, 3);

  if (!retrievedDocs || retrievedDocs.length === 0) {
    return {
      answer: "No sufficiently relevant verified career documents were found in the knowledge base to answer your specific query with grounded citations. Please refine your search or ask about our covered career tracks (Full Stack, AI/ML, Data Science, Cloud/DevOps, Cybersecurity, Mobile).",
      citations: [],
      hasSufficientContext: false
    };
  }

  const contextText = retrievedDocs
    .map((doc, idx) => `[Source ${idx + 1}: ${doc.title} (${doc.sourceName})]\n${doc.content}`)
    .join('\n\n---\n\n');

  const systemInstruction = `You are an AI Career Guidance RAG Specialist. Answer the student's question using ONLY the provided verified context.
Strict Rules:
1. Ground every recommendation and fact in the retrieved sources.
2. Never invent companies, certifications, or statistics not supported by the context.
3. Explicitly cite the sources as [Source 1], [Source 2], etc.
4. If the retrieved context is insufficient to answer part of the question, clearly state that the knowledge base does not contain that information.`;

  const prompt = `Context:\n${contextText}\n\nStudent Question: ${query}\n\nProvide a structured, helpful answer grounded in the sources above.`;

  const aiResponse = await generateGeminiContent(prompt, systemInstruction, false);

  if (aiResponse && typeof aiResponse === 'string') {
    return {
      answer: aiResponse,
      citations: retrievedDocs.map(d => ({
        title: d.title,
        sourceName: d.sourceName,
        sourceUrl: d.sourceUrl,
        relevanceScore: d.relevanceScore
      })),
      hasSufficientContext: true
    };
  }

  // Deterministic synthesis fallback
  const topDoc = retrievedDocs[0];
  const synthesis = `Based on verified career documentation from ${topDoc.sourceName} regarding "${topDoc.title}":\n\n${topDoc.summary}\n\nKey Core Highlights:\n${topDoc.content.slice(0, 450)}...\n\n(Refer to the verified source links below for the complete reference framework.)`;

  return {
    answer: synthesis,
    citations: retrievedDocs.map(d => ({
      title: d.title,
      sourceName: d.sourceName,
      sourceUrl: d.sourceUrl,
      relevanceScore: d.relevanceScore
    })),
    hasSufficientContext: true
  };
}

module.exports = {
  initKnowledgeBase,
  retrieveKnowledge,
  answerWithRAG
};

