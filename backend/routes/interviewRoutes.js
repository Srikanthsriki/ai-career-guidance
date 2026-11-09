const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

router.post('/start', interviewController.startInterviewSession);
router.post('/submit-answer', interviewController.submitAnswer);
router.get('/session/:id?', interviewController.getSession);
router.get('/history', interviewController.getSession);

module.exports = router;

