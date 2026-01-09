import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, enum: ["page_view", "click"] },
    pageUrl: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    clickX: Number,
    clickY: Number,
    userAgent: String,
    screenWidth: Number,
    screenHeight: Number
  },
  { timestamps: true }
);

eventSchema.index({ sessionId: 1, timestamp: 1 });
eventSchema.index({ pageUrl: 1, eventType: 1 });

export default mongoose.model("Event", eventSchema);