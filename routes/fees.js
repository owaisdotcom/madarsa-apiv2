import express from 'express';
import {
  getFees,
  getFee,
  getStudentFees,
  createFee,
  getMonthlyFees
} from '../controllers/feeController.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateFee = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Year must be valid')
];

router.route('/')
  .get(getFees)
  .post(validateFee, createFee);

router.route('/monthly')
  .get(getMonthlyFees);

router.route('/student/:studentId')
  .get(getStudentFees);

router.route('/:id')
  .get(getFee);

export default router;
