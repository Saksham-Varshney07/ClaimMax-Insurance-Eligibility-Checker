import { Request, Response, NextFunction } from "express";
import { validateEscalateInput } from "../middleware/validate";
import { escalateService } from "../services/escalateService";

export const generateEscalation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const error = validateEscalateInput(req.body);
        if (error) {
            res.status(400).json({ error });
            return;
        }

        const { firData, classification, refusalDetails, sessionId } = req.body;
        const escalationDocs = await escalateService.generateEscalationDocs(
            firData,
            classification,
            refusalDetails,
            sessionId
        );

        res.json({ escalationDocs });
    } catch (err) {
        next(err);
    }
};
