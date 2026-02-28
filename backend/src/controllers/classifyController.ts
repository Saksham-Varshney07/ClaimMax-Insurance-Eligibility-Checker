import { Request, Response, NextFunction } from "express";
import { validateClassifyInput } from "../middleware/validate";
import { classifyService } from "../services/classifyService";

export const classifyIncident = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const error = validateClassifyInput(req.body);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        const { transcript, language = "hi-IN" } = req.body;
        const classification = await classifyService.classifyIncident(
            transcript,
            language
        );

        res.json({ classification });
    } catch (err) {
        next(err);
    }
};
