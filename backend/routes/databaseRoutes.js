const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');

router.get('/status', databaseController.getDatabaseStatus);
router.get('/collections', (req, res) => {
  const db = require('../database/dbEngine');
  res.status(200).json({ success: true, stats: db.getStats() });
});
router.get('/collection/:name', databaseController.getCollection);
router.post('/seed', databaseController.seedDatabase);
router.get('/export', databaseController.exportDatabase);

module.exports = router;

