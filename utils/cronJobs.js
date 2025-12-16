import cron from 'node-cron';
import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import { getPendingFeeReminders } from '../services/whatsappService.js';

/**
 * Check if current date is between 1st and 10th of the month
 * and if it's a reminder day (1st, 3rd, 5th, 7th, 9th)
 */
const shouldSendReminder = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  // Check if day is between 1st and 10th
  if (day < 1 || day > 10) {
    return false;
  }

  // Check if it's a reminder day (1, 3, 5, 7, 9)
  const reminderDays = [1, 3, 5, 7, 9];
  if (!reminderDays.includes(day)) {
    return false;
  }

  return { month, year, day };
};

/**
 * Log pending fee reminders (for manual sending)
 * Since we can't auto-open WhatsApp, we'll log the reminders
 * that need to be sent manually
 */
const logPendingFeeReminders = async () => {
  try {
    const reminderInfo = shouldSendReminder();
    if (!reminderInfo) {
      return;
    }

    const { month, year } = reminderInfo;
    console.log(`\n=== Fee Reminder Day: ${reminderInfo.day}/${month}/${year} ===`);
    console.log(`Checking for pending fees...\n`);

    const result = await getPendingFeeReminders(month, year);

    if (result.success && result.reminders.length > 0) {
      console.log(`Found ${result.reminders.length} overdue students:\n`);
      result.reminders.forEach((reminder, index) => {
        console.log(`${index + 1}. ${reminder.studentName} (${reminder.phone})`);
        console.log(`   Amount: PKR${reminder.amount}`);
        console.log(`   Due Date: ${reminder.feeDueDate || 10}th of each month`);
        console.log(`   WhatsApp Link: ${reminder.link}\n`);
      });
      console.log(`\nPlease send reminders manually using the links above.`);
      console.log(`You can also view overdue reminders in the dashboard.\n`);
    } else {
      console.log('No overdue fees found for this month.\n');
    }
  } catch (error) {
    console.error('Error in fee reminder cron job:', error);
  }
};

// Run cron job daily at 10:00 AM IST
// This will log pending reminders that need to be sent manually
cron.schedule('0 10 * * *', logPendingFeeReminders, {
  scheduled: true,
  timezone: 'Asia/Kolkata'
});

console.log('Fee reminder cron job scheduled (runs daily at 10:00 AM IST)');
console.log('Reminders will be logged for manual sending via WhatsApp Web links');

export { logPendingFeeReminders };
