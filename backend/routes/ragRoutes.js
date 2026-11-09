const express = require('express');
const router = express.Router();
const ragController = require('../controllers/ragController');

router.post('/query', ragController.askKnowledgeBase);
router.get('/documents', ragController.getDocuments);

module.exports = router;

