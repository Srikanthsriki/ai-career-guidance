const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.post('/validate-save', profileController.validateAndSaveProfile);
router.get('/latest', profileController.getLatestProfile);

module.exports = router;

