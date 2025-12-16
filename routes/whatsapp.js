import express from 'express';
import {
  getAnnouncementLinksController,
  getReminderLink,
  getPendingReminders,
  getGroupReminderLinkController,
  getAnnouncements
} from '../controllers/whatsappController.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateAnnouncement = [
  body('type').isIn(['holiday', 'timing_change', 'general']).withMessage('Invalid announcement type'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

router.route('/get-announcement-links')
  .post(validateAnnouncement, getAnnouncementLinksController);

router.route('/get-reminder-link/:studentId')
  .get(getReminderLink);

router.route('/pending-reminders')
  .get(getPendingReminders);

router.route('/group-reminder-link')
  .get(getGroupReminderLinkController);

router.route('/announcements')
  .get(getAnnouncements);

export default router;
