import Student from '../models/Student.js';
import Announcement from '../models/Announcement.js';
import {
  getFeeReminderLink,
  getPaymentConfirmationLink,
  getAnnouncementLinks,
  getPendingFeeReminders,
  getGroupReminderLink
} from '../services/whatsappService.js';

// @desc    Get announcement links for all students
// @route   POST /api/whatsapp/get-announcement-links
// @access  Public
export const getAnnouncementLinksController = async (req, res, next) => {
  try {
    const { type, message, useGroup } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        error: 'Type and message are required'
      });
    }

    const result = await getAnnouncementLinks(type, message, useGroup);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Save announcement record
    await Announcement.create({
      type,
      message,
      sentTo: result.isGroup ? [] : result.links.map(link => link.studentId),
      sentAt: new Date()
    });

    res.status(200).json({
      success: true,
      data: {
        totalStudents: result.totalStudents,
        isGroup: result.isGroup || false,
        groupLink: result.groupLink || null,
        links: result.links
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reminder link for a student
// @route   GET /api/whatsapp/get-reminder-link/:studentId
// @access  Public
export const getReminderLink = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    const now = new Date();
    const reminderMonth = month ? parseInt(month) : now.getMonth() + 1;
    const reminderYear = year ? parseInt(year) : now.getFullYear();

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const result = await getFeeReminderLink(
      studentId,
      reminderMonth,
      reminderYear,
      student.monthlyFee
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending fee reminders
// @route   GET /api/whatsapp/pending-reminders
// @access  Public
export const getPendingReminders = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const reminderMonth = month ? parseInt(month) : now.getMonth() + 1;
    const reminderYear = year ? parseInt(year) : now.getFullYear();

    const result = await getPendingFeeReminders(reminderMonth, reminderYear);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group reminder link for overdue fees
// @route   GET /api/whatsapp/group-reminder-link
// @access  Public
export const getGroupReminderLinkController = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const reminderMonth = month ? parseInt(month) : now.getMonth() + 1;
    const reminderYear = year ? parseInt(year) : now.getFullYear();

    const result = await getGroupReminderLink(reminderMonth, reminderYear);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get announcement history
// @route   GET /api/whatsapp/announcements
// @access  Public
export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('sentTo', 'fullName phone')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    next(error);
  }
};
