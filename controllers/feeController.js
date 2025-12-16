import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import { getPaymentConfirmationLink } from '../services/whatsappService.js';

// @desc    Get all fees
// @route   GET /api/fees
// @access  Public
export const getFees = async (req, res, next) => {
  try {
    const { studentId, month, year, status } = req.query;
    const query = {};

    if (studentId) query.studentId = studentId;
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const fees = await Fee.find(query)
      .populate('studentId', 'fullName phone flatName flatNo')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single fee
// @route   GET /api/fees/:id
// @access  Public
export const getFee = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('studentId');

    if (!fee) {
      return res.status(404).json({
        success: false,
        error: 'Fee record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fees for a specific student
// @route   GET /api/fees/student/:studentId
// @access  Public
export const getStudentFees = async (req, res, next) => {
  try {
    const fees = await Fee.find({ studentId: req.params.studentId })
      .populate('studentId', 'fullName phone')
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fee payment
// @route   POST /api/fees
// @access  Public
export const createFee = async (req, res, next) => {
  try {
    // Check if student exists
    const student = await Student.findById(req.body.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if fee already paid for this month/year
    const existingFee = await Fee.findOne({
      studentId: req.body.studentId,
      month: req.body.month,
      year: req.body.year
    });

    if (existingFee && existingFee.status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Fee already paid for this month'
      });
    }

    // Create fee record
    const feeData = {
      ...req.body,
      status: 'paid'
    };

    const fee = await Fee.create(feeData);

    // Populate student data
    await fee.populate('studentId', 'fullName phone flatName flatNo');

    // Generate WhatsApp confirmation link
    let whatsappLink = null;
    try {
      const linkResult = await getPaymentConfirmationLink(
        req.body.studentId,
        fee.amount,
        fee.month,
        fee.year
      );
      if (linkResult.success) {
        whatsappLink = linkResult.link;
      }
    } catch (whatsappError) {
      console.error('WhatsApp link generation failed:', whatsappError);
      // Don't fail the request if WhatsApp link generation fails
    }

    res.status(201).json({
      success: true,
      data: {
        ...fee.toObject(),
        whatsappLink
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly fees summary
// @route   GET /api/fees/monthly
// @access  Public
export const getMonthlyFees = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Month and year are required'
      });
    }

    const fees = await Fee.find({
      month: parseInt(month),
      year: parseInt(year)
    })
      .populate('studentId', 'fullName phone')
      .sort({ paidDate: -1 });

    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidCount = fees.filter(f => f.status === 'paid').length;

    res.status(200).json({
      success: true,
      data: {
        month: parseInt(month),
        year: parseInt(year),
        totalAmount,
        paidCount,
        totalCount: fees.length,
        fees
      }
    });
  } catch (error) {
    next(error);
  }
};
