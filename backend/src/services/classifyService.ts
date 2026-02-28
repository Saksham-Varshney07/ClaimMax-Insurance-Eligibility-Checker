import { CLASSIFY_PROMPT } from "../lib/prompts";
import { callLLMForJSON } from "../lib/llm";
import { complaintRepository } from "../repositories/complaintRepository";
import { ClassificationResult } from "../types";

export const classifyService = {
    async classifyIncident(transcript: string, language: string): Promise<ClassificationResult> {
        const classification = await callLLMForJSON<ClassificationResult>(
            CLASSIFY_PROMPT,
            transcript
        );

        // Fire-and-forget save to DB
        complaintRepository
            .saveComplaint({ transcript, language, classification })
            .catch((err) =>
                console.error("[classifyService] DB operation failed (non-fatal):", err.message)
            );

        return classification;
    },
};
