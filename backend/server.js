import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bountyRoutes from "./routes/bountyRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";

connectDB();

const app = express();

// Enable CORS for all origins (adjust for production later)
app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "backend", "uploads"))
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/gigs", gigRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/disputes", disputeRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/bounties", bountyRoutes);
app.use("/api/v1/onboarding", onboardingRoutes);

// Direct fallback route for onboarding steps that bypasses all middleware
app.get("/api/v1/onboarding-direct", (req, res) => {
  const steps = [
    { id: 1, title: 'Welcome to SecureLance!', description: 'Let\'s get you started.', targetElement: '.dashboard-container', order: 1 },
    { id: 2, title: 'Browse Contracts', description: 'Find your first gig or post a new one.', targetElement: 'a[href="/browse"]', order: 2 },
    { id: 3, title: 'Your Profile', description: 'Complete your profile to attract more clients or freelancers.', targetElement: 'a[href="/profile"]', order: 3 },
    { id: 4, title: 'How it Works', description: 'Understand the SecureLance workflow.', targetElement: '.how-it-works-section', order: 4 },
    { id: 5, title: 'Need Help?', description: 'Use our AI Assistant for any questions.', targetElement: '.ai-chat-button', order: 5 }
  ];
  res.json(steps);
});

app.get("/", (req, res) => {
  res.send("SecureLance API Running");
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
