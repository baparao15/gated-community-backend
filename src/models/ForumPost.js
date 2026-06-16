const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

const forumPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: ['general', 'buy-sell', 'help', 'events', 'feedback', 'other'],
      default: 'general',
    },
    comments: [commentSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

forumPostSchema.index({ author: 1 });
forumPostSchema.index({ createdAt: -1 });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
module.exports = ForumPost;
