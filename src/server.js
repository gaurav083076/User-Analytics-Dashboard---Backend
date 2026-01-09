import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import eventRoutes from "./routes/event.js";
import healthRoutes from "./routes/health.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Middlewares
app.use(
  cors({
    origin: [process.env.TARGET_URL, process.env.FRONTEND_URL],
    credentials: true
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../tracking")));

//Routes
app.use("/api/events", eventRoutes);
app.use("/health", healthRoutes);


//DB and server start
connectDB()
  .then(() => {
    console.log("DB connected successfully!");
    app.listen(process.env.PORT, () => {
      console.log("Server connected successfully!");
    });
  })
  .catch((error) => {
    console.error("Database not connected successfully!", error);
    process.exit(1);
  });