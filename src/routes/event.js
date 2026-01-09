import express from "express";
import Event from "../models/event.js";

const router = express.Router();

// Store event
router.post("/track", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ success: true, eventId: event._id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: "$sessionId",
          eventCount: { $sum: 1 },
          firstSeen: { $min: "$timestamp" },
          lastSeen: { $max: "$timestamp" },
          pages: { $addToSet: "$pageUrl" }
        }
      },
      {
        $project: {
          sessionId: "$_id",
          eventCount: 1,
          firstSeen: 1,
          lastSeen: 1,
          pageCount: { $size: "$pages" },
          _id: 0
        }
      },
      { $sort: { lastSeen: -1 } }
    ]);

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get session events
router.get("/sessions/:sessionId", async (req, res) => {
  try {
    const events = await Event.find({ sessionId: req.params.sessionId })
      .sort({ timestamp: 1 })
      .lean();

    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get heatmap data
router.get("/heatmap", async (req, res) => {
  const { pageUrl } = req.query;

  if (!pageUrl) {
    return res
      .status(400)
      .json({ success: false, error: "pageUrl parameter is required" });
  }

  try {
    const clicks = await Event.find({
      pageUrl,
      eventType: "click",
      clickX: { $exists: true },
      clickY: { $exists: true }
    }).lean();

    res.json({ success: true, clicks, totalClicks: clicks.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tracked pages
router.get("/pages", async (req, res) => {
  try {
    const pages = await Event.distinct("pageUrl");
    res.json({ success: true, pages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;