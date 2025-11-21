const mongoose = require("mongoose");

const userProgressItemSchema = new mongoose.Schema({
  itemIndex: { type: Number, required: true }, // index in contentItems[]
  type: { type: String, enum: ["chapter", "quiz"], required: true },

  // Lecture progression
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },

  // Video progression
  watchedSeconds: { type: Number, default: 0 },
  totalSeconds: { type: Number, default: 0 },
  videoCompleted: { type: Boolean, default: false },

  // Quiz results
  score: { type: Number },
  passed: { type: Boolean },
  attempts: { type: Number, default: 0 },
});

const userCourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // GLOBAL progression %
    progress: { type: Number, default: 0 },

    // Resume feature
    lastVisitedContent: { type: Number, default: 0 }, // index dans contentItems[]

    // Lecture progression for each item
    itemsProgress: [userProgressItemSchema],

    // Total time spent on the course (minutes)
    timeSpent: { type: Number, default: 0 },

    // Course finishing
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },

    // Certificate
    certificateIssued: { type: Boolean, default: false },
    certificateId: { type: String },
  },
  { timestamps: true }
);

// Avoid duplicate enrollments
userCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("UserCourse", userCourseSchema);
