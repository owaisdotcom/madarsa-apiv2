import Student from '../models/Student.js';

/**
 * Format phone number for WhatsApp Web URL
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  // Remove any existing whatsapp: prefix or + sign
  let formatted = phone.replace(/^whatsapp:/, '').replace(/^\+/, '');
  // Remove any spaces or special characters except digits
  formatted = formatted.replace(/\D/g, '');
  return formatted;
};

/**
 * Generate WhatsApp Web URL with pre-filled message
 */
export const generateWhatsAppLink = (phone, message) => {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    return null;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

/**
 * Generate WhatsApp Group link with pre-filled message
 */
export const generateWhatsAppGroupLink = (groupInviteCode, message) => {
  if (!groupInviteCode) {
    return null;
  }

  // Extract invite code from full URL if provided
  let inviteCode = groupInviteCode;
  if (groupInviteCode.includes('chat.whatsapp.com/')) {
    inviteCode = groupInviteCode.split('chat.whatsapp.com/')[1].split('?')[0];
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://chat.whatsapp.com/${inviteCode}?text=${encodedMessage}`;
};

/**
 * Get WhatsApp group link from environment or default
 */
export const getWhatsAppGroupLink = () => {
  // Default group link from user
  const defaultGroupLink = 'https://chat.whatsapp.com/DORRpChWn6V3J7erUo102N';
  return process.env.WHATSAPP_GROUP_LINK || defaultGroupLink;
};

/**
 * Generate fee reminder message
 */
export const generateFeeReminderMessage = (studentName, month, year, amount) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[month - 1];

  return `Assalamu Alaikum ${studentName},\n\n` +
    `This is a reminder that your Madarsa fee for ${monthName} ${year} is pending.\n` +
    `Amount: PKR${amount}\n` +
    `Please make the payment at your earliest convenience.\n\n` +
    `JazakAllah Khair`;
};

/**
 * Generate fee reminder link for a student
 */
export const getFeeReminderLink = async (studentId, month, year, amount) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    const message = generateFeeReminderMessage(student.fullName, month, year, amount);
    const link = generateWhatsAppLink(student.phone, message);

    if (!link) {
      return { success: false, error: 'Invalid phone number' };
    }

    return {
      success: true,
      link,
      phone: student.phone,
      studentName: student.fullName
    };
  } catch (error) {
    console.error('Error generating fee reminder link:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate payment confirmation message
 */
export const generatePaymentConfirmationMessage = (studentName, amount, month, year) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[month - 1];

  return `Assalamu Alaikum ${studentName},\n\n` +
    `Your Madarsa fee payment has been confirmed.\n` +
    `Amount: PKR${amount}\n` +
    `Month: ${monthName} ${year}\n` +
    `Thank you for your payment.\n\n` +
    `JazakAllah Khair`;
};

/**
 * Generate payment confirmation link
 */
export const getPaymentConfirmationLink = async (studentId, amount, month, year) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    const message = generatePaymentConfirmationMessage(student.fullName, amount, month, year);
    const link = generateWhatsAppLink(student.phone, message);

    if (!link) {
      return { success: false, error: 'Invalid phone number' };
    }

    return {
      success: true,
      link,
      phone: student.phone,
      studentName: student.fullName
    };
  } catch (error) {
    console.error('Error generating payment confirmation link:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate announcement message
 */
export const generateAnnouncementMessage = (type, message) => {
  if (type === 'holiday') {
    return `*Holiday Announcement*\n\n${message}`;
  } else if (type === 'timing_change') {
    return `*Timing Change Announcement*\n\n${message}`;
  } else {
    return `*Announcement*\n\n${message}`;
  }
};

/**
 * Generate announcement links for all active students
 */
export const getAnnouncementLinks = async (type, message, useGroup = false) => {
  try {
    const announcementMessage = generateAnnouncementMessage(type, message);

    // If using group, return group link
    if (useGroup) {
      const groupLink = getWhatsAppGroupLink();
      const link = generateWhatsAppGroupLink(groupLink, announcementMessage);
      
      return {
        success: true,
        totalStudents: 0,
        isGroup: true,
        groupLink: link,
        links: [{
          type: 'group',
          link: link,
          label: 'WhatsApp Group'
        }]
      };
    }

    // Otherwise, generate individual links
    const students = await Student.find({ isActive: true });
    if (students.length === 0) {
      return { success: false, error: 'No active students found' };
    }

    const links = [];

    for (const student of students) {
      const link = generateWhatsAppLink(student.phone, announcementMessage);
      if (link) {
        links.push({
          studentId: student._id,
          studentName: student.fullName,
          phone: student.phone,
          link
        });
      }
    }

    return {
      success: true,
      totalStudents: students.length,
      isGroup: false,
      links
    };
  } catch (error) {
    console.error('Error generating announcement links:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate group reminder message for overdue fees
 */
export const generateGroupReminderMessage = (overdueStudents, month, year) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[month - 1];

  let message = `*Fee Reminder - ${monthName} ${year}*\n\n`;
  message += `Assalamu Alaikum,\n\n`;
  message += `This is a reminder for the following students with pending fees:\n\n`;

  overdueStudents.forEach((student, index) => {
    message += `${index + 1}. ${student.studentName}\n`;
    message += `   Amount: PKR${student.amount}\n`;
    message += `   Due Date: ${student.feeDueDate || 10}th\n\n`;
  });

  message += `Please make the payment at your earliest convenience.\n\n`;
  message += `JazakAllah Khair`;

  return message;
};

/**
 * Get group reminder link for overdue fees
 */
export const getGroupReminderLink = async (month, year) => {
  try {
    const result = await getPendingFeeReminders(month, year);
    
    if (!result.success || result.reminders.length === 0) {
      return { success: false, error: 'No overdue students found' };
    }

    const reminderMessage = generateGroupReminderMessage(result.reminders, month, year);
    const groupLink = getWhatsAppGroupLink();
    const link = generateWhatsAppGroupLink(groupLink, reminderMessage);

    return {
      success: true,
      link,
      isGroup: true,
      overdueCount: result.reminders.length
    };
  } catch (error) {
    console.error('Error generating group reminder link:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a student is overdue based on their fee due date
 */
const isOverdue = (student, month, year) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // If we're checking for a different month/year, check if that month/year has passed
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return true; // Past month/year is definitely overdue
  }

  // If checking current month/year, check if due date has passed
  if (year === currentYear && month === currentMonth) {
    const dueDate = student.feeDueDate || 10; // Default to 10th if not set
    return currentDay > dueDate;
  }

  // Future month/year is not overdue
  return false;
};

/**
 * Get pending fee reminders for current month
 * Shows students who haven't paid and are overdue based on their due date
 */
export const getPendingFeeReminders = async (month, year) => {
  try {
    const students = await Student.find({ isActive: true });
    const Fee = (await import('../models/Fee.js')).default;
    
    const paidFees = await Fee.find({
      month,
      year,
      status: 'paid'
    });

    const paidStudentIds = new Set(paidFees.map(fee => fee.studentId.toString()));

    const studentsWithPendingFees = students.filter(
      student => !paidStudentIds.has(student._id.toString())
    );

    const reminders = [];

    for (const student of studentsWithPendingFees) {
      const overdue = isOverdue(student, month, year);
      
      // Only include overdue students in reminders
      if (overdue) {
        const message = generateFeeReminderMessage(
          student.fullName,
          month,
          year,
          student.monthlyFee
        );
        const link = generateWhatsAppLink(student.phone, message);

        if (link) {
          reminders.push({
            studentId: student._id,
            studentName: student.fullName,
            phone: student.phone,
            amount: student.monthlyFee,
            feeDueDate: student.feeDueDate || 10,
            overdue: true,
            link
          });
        }
      }
    }

    return {
      success: true,
      count: reminders.length,
      reminders
    };
  } catch (error) {
    console.error('Error getting pending fee reminders:', error);
    return { success: false, error: error.message };
  }
};
