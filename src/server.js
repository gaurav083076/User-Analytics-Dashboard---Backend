import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors({
  origin: [process.env.TARGET_URL, process.env.FRONTEND_URL],
  credentials: true
}));
app.use(express.json());
app.use(express.static('../tracking'));

// Event Model
const eventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  eventType: { type: String, required: true, enum: ['page_view', 'click'] },
  pageUrl: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  clickX: { type: Number },
  clickY: { type: Number },
  userAgent: String,
  screenWidth: Number,
  screenHeight: Number
}, { timestamps: true });

eventSchema.index({ sessionId: 1, timestamp: 1 });
eventSchema.index({ pageUrl: 1, eventType: 1 });

const Event = mongoose.model('Event', eventSchema);

// Routes

// Store event
app.post('/api/events/track', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ success: true, eventId: event._id });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all sessions
app.get('/api/events/sessions', async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$sessionId',
          eventCount: { $sum: 1 },
          firstSeen: { $min: '$timestamp' },
          lastSeen: { $max: '$timestamp' },
          pages: { $addToSet: '$pageUrl' }
        }
      },
      {
        $project: {
          sessionId: '$_id',
          eventCount: 1,
          firstSeen: 1,
          lastSeen: 1,
          pageCount: { $size: '$pages' },
          _id: 0
        }
      },
      { $sort: { lastSeen: -1 } }
    ]);
    
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get session events
app.get('/api/events/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const events = await Event.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();
    
    res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching session events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get heatmap data
app.get('/api/events/heatmap', async (req, res) => {
  try {
    const { pageUrl } = req.query;
    
    if (!pageUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'pageUrl parameter is required' 
      });
    }
    
    const clicks = await Event.find({
      pageUrl,
      eventType: 'click',
      clickX: { $exists: true },
      clickY: { $exists: true }
    })
    .select('clickX clickY timestamp sessionId')
    .sort({ timestamp: -1 })
    .lean();
    
    res.json({ success: true, clicks, totalClicks: clicks.length });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tracked pages
app.get('/api/events/pages', async (req, res) => {
  try {
    const pages = await Event.distinct('pageUrl');
    res.json({ success: true, pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });