import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  flatName: {
    type: String,
    required: [true, 'Flat name is required'],
    trim: true
  },
  flatNo: {
    type: String,
    required: [true, 'Flat number is required'],
    trim: true
  },
  monthlyFee: {
    type: Number,
    required: [true, 'Monthly fee is required'],
    min: [0, 'Monthly fee cannot be negative']
  },
  feeDueDate: {
    type: Number,
    required: [true, 'Fee due date is required'],
    min: [1, 'Due date must be between 1 and 31'],
    max: [31, 'Due date must be between 1 and 31']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
studentSchema.index({ phone: 1 });
studentSchema.index({ isActive: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
