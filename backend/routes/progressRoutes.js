const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

router.get('/', progressController.getProgress);
router.post('/task', progressController.updateProgressTask);

module.exports = router;

