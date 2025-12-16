import express from 'express';
import {
  getDashboardStats,
  getMonthlyFeesBreakdown
} from '../controllers/dashboardController.js';

const router = express.Router();

router.route('/stats')
  .get(getDashboardStats);

router.route('/monthly-fees')
  .get(getMonthlyFeesBreakdown);

export default router;
