const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/summary', analyticsController.getAnalyticsSummary);
router.get('/alignment', analyticsController.getCareerAlignment);

module.exports = router;

