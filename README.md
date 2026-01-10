# User Analytics Dashboard - Backend

Node.js backend service for collecting and serving user analytics data.

## Tech Stack

- Node.js
- Express 4
- MongoDB (Mongoose 8)

## Setup

1. Clone the repository
```bash
git clone https://github.com/gaurav083076/User-Analytics-Dashboard---Backend.git
cd User-Analytics-Dashboard---Backend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
FRONTEND_URL=http://localhost:3010
TARGET_URL=your_tracked_website_url
```

4. Start server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. Server runs on http://localhost:5000

## APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events/track` | POST | Store event |
| `/api/events/sessions` | GET | List all sessions |
| `/api/events/sessions/:sessionId` | GET | Get session events |
| `/api/events/heatmap` | GET | Get click data for heatmap |
| `/api/events/pages` | GET | Get tracked pages |
| `/health` | GET | Health check |

## Tracking Script

The `tracking/tracker.js` file can be embedded on any website:

```html
<script src="https://your-domain.com/tracker.js"></script>
```
