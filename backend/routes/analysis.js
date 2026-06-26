/**
 * ============================================================
 *  ROUTES: /api/*
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/analysisController');

router.post('/analyze', controller.createAnalysis);
router.get('/analysis/:id', controller.getAnalysis);
router.get('/analysis/:id/download', controller.downloadAnalysis);
router.get('/history', controller.getHistory);

module.exports = router;
