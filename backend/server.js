import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// --- Load .env variables FIRST ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
// --- End loading .env ---

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js"; // Import dispute routes
import adminRoutes from "./routes/adminRoutes.js"; // Import admin routes
import bountyRoutes from "./routes/bountyRoutes.js"; // Import bounty routes

// Then connect to the database
connectDB();

const app = express();
const corsOptions = {
  origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:5173", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parser
app.use(express.json());

// Static files
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "backend", "uploads"))
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/gigs", gigRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/disputes", disputeRoutes); // Use dispute routes
app.use("/api/v1/admin", adminRoutes); // Use admin routes
app.use("/api/v1/bounties", bountyRoutes); // Use bounty routes

// Root route
app.get("/", (req, res) => {
  res.send("SecureLance API Running");
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
