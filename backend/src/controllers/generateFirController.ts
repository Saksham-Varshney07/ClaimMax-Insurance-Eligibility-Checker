import { Request, Response, NextFunction } from "express";
import { validateGenerateFirInput } from "../middleware/validate";
import { firService } from "../services/firService";

export const generateFir = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const error = validateGenerateFirInput(req.body);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        const { transcript, classification, sessionId } = req.body;
        const firData = await firService.generateFir(
            transcript,
            classification,
            sessionId
        );

        res.json({ firData });
    } catch (err) {
        next(err);
    }
};
