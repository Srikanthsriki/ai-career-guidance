const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

router.get('/learning', resourceController.getLearningResources);
router.get('/jobs', resourceController.getJobOpportunities);

module.exports = router;

