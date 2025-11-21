const mongoose = require("mongoose");

// Quiz schema
const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number }, // index of correct option
});

// Content Item schema: can be chapter or quiz
const contentItemSchema = new mongoose.Schema({
  type: { type: String, enum: ["chapter", "quiz"], required: true },
  title: { type: String, required: true },

  // Chapter-specific fields
  videoUrl: {
    url: { type: String },
    public_id: { type: String },
  },
  content: { type: String }, // Rich text content
  imageUrl: {
    url: { type: String },
    public_id: { type: String },
  },

  // Quiz-specific fields
  quiz: [quizSchema],
});

// Main course schema
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    thumbnail: {
      url: { type: String },
      public_id: { type: String },
    },
    promoVideo: {
      url: { type: String },
      public_id: { type: String },
    },

    // Instructor info
    Instructeur: { type: String, required: true },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Course details
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    price: { type: Number, default: 0 }, // 0 = free
    discountPrice: { type: Number, default: 0 },
    duration: { type: String },
    language: { type: String },
    category: { type: String },
    prerequisites: { type: String },

    contentItems: [contentItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
