import express from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  activateStudent,
  deactivateStudent
} from '../controllers/studentController.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateStudent = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('flatName').trim().notEmpty().withMessage('Flat name is required'),
  body('flatNo').trim().notEmpty().withMessage('Flat number is required'),
  body('monthlyFee').isNumeric().withMessage('Monthly fee must be a number'),
  body('feeDueDate').isInt({ min: 1, max: 31 }).withMessage('Fee due date must be between 1 and 31')
];

router.route('/')
  .get(getStudents)
  .post(validateStudent, createStudent);

router.route('/:id')
  .get(getStudent)
  .put(validateStudent, updateStudent)
  .delete(deleteStudent);

router.route('/:id/activate')
  .patch(activateStudent);

router.route('/:id/deactivate')
  .patch(deactivateStudent);

export default router;
