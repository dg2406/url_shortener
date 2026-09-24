import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now
    },

    ip: String,

    userAgent: String,

    referrer: String
  },
  {
    _id: false
  }
);

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    clicks: {
      type: Number,
      default: 0
    },

    clickData: [clickSchema],

    expiresAt: {
      type: Date,
      default: null
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Url", urlSchema);