import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['holiday', 'timing_change', 'general'],
    required: [true, 'Announcement type is required']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  sentTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
