const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.post('/chat', agentController.chatWithAgent);
router.get('/mcp-tools', agentController.getMcpToolsCatalog);

module.exports = router;

