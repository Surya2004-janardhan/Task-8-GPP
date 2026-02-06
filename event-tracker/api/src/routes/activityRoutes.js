const express = require('express');
const router = express.Router();
const { ingestActivity } = require('../controllers/activityController');
const rateLimiter = require('../middlewares/rateLimiter');

router.post('/activities', rateLimiter, ingestActivity);

module.exports = router;
