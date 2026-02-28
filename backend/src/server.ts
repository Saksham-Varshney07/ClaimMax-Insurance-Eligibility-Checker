import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { classifyRouter } from "./routes/classify";
import { generateFirRouter } from "./routes/generateFir";
import { escalateRouter } from "./routes/escalate";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const port = process.env.PORT || 3000;

// CORS
const allowedOrigins = [
    "http://localhost:5173",
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Express config
app.use(express.json({ limit: "10mb" }));

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 reqs per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
});

// Routes
app.use("/api/classify", apiLimiter, classifyRouter);
app.use("/api/generate-fir", apiLimiter, generateFirRouter);
app.use("/api/escalate", apiLimiter, escalateRouter);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Error Handler (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
    console.log(`[Server] Listening on port ${port}`);
    console.log(`[LLM Status] Gemini API Key provided: ${!!process.env.GEMINI_API_KEY}`);
    console.log(`[LLM Status] Groq API Key provided: ${!!process.env.GROQ_API_KEY}`);
});
