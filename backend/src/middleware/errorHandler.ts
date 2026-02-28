import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error(`[ErrorHandler] [${new Date().toISOString()}] ${req.method} ${req.path} - ${err.message}`);

    if (err.message.includes("LLM")) {
        res.status(502).json({ error: "AI service unavailable, try again" });
        return;
    }

    if (err.message.includes("invalid JSON")) {
        res.status(500).json({ error: "AI returned unexpected response" });
        return;
    }

    res.status(500).json({ error: err.message || "Internal server error" });
};
