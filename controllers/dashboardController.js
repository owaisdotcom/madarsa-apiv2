import Student from '../models/Student.js';
import Fee from '../models/Fee.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Total students
    const totalStudents = await Student.countDocuments({ isActive: true });

    // Current month fees
    const currentMonthFees = await Fee.find({
      month: currentMonth,
      year: currentYear,
      status: 'paid'
    });
    const currentMonthTotal = currentMonthFees.reduce((sum, fee) => sum + fee.amount, 0);
    const currentMonthPaidCount = currentMonthFees.length;

    // Previous month fees
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = currentYear - 1;
    }

    const prevMonthFees = await Fee.find({
      month: prevMonth,
      year: prevYear,
      status: 'paid'
    });
    const prevMonthTotal = prevMonthFees.reduce((sum, fee) => sum + fee.amount, 0);
    const prevMonthPaidCount = prevMonthFees.length;

    // Pending fees count (students who haven't paid current month)
    const allActiveStudents = await Student.find({ isActive: true });
    const paidStudentIds = new Set(
      currentMonthFees.map(fee => fee.studentId.toString())
    );
    const pendingCount = allActiveStudents.filter(
      student => !paidStudentIds.has(student._id.toString())
    ).length;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        currentMonth: {
          month: currentMonth,
          year: currentYear,
          totalFees: currentMonthTotal,
          paidCount: currentMonthPaidCount,
          pendingCount
        },
        previousMonth: {
          month: prevMonth,
          year: prevYear,
          totalFees: prevMonthTotal,
          paidCount: prevMonthPaidCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly fees breakdown for charts
// @route   GET /api/dashboard/monthly-fees
// @access  Public
export const getMonthlyFeesBreakdown = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyData = [];

    for (let i = 0; i < parseInt(months); i++) {
      let month = currentMonth - i;
      let year = currentYear;

      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      const fees = await Fee.find({
        month,
        year,
        status: 'paid'
      });

      const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
      const paidCount = fees.length;

      monthlyData.push({
        month,
        year,
        monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        totalAmount,
        paidCount
      });
    }

    // Reverse to show oldest first
    monthlyData.reverse();

    res.status(200).json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    next(error);
  }
};
