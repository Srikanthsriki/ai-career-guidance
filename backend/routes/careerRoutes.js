const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');

router.post('/recommend', careerController.generateRecommendation);
router.get('/latest', careerController.getLatestRecommendation);
router.post('/compare', careerController.compareCareers);

module.exports = router;

