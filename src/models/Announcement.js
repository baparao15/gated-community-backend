const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['notice', 'event', 'emergency'], required: true },
    audience: {
      type: String,
      enum: ['all', 'residents', 'staff', 'guards'],
      default: 'all',
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventDate: { type: Date },
    expiresAt: { type: Date },
    attachments: [{ type: String }],
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

announcementSchema.index({ type: 1, isActive: 1 });
announcementSchema.index({ audience: 1 });
announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;
