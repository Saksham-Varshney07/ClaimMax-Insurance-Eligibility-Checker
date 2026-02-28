import { FIR_GENERATION_PROMPT } from "../lib/prompts";
import { callLLMForJSON } from "../lib/llm";
import { complaintRepository } from "../repositories/complaintRepository";
import { ClassificationResult, FIRData } from "../types";

export const firService = {
    async generateFir(
        transcript: string,
        classification: ClassificationResult,
        sessionId?: string
    ): Promise<FIRData> {
        const promptContext = `
      User Transcript:
      ${transcript}

      Classification Details:
      Is Cognizable: ${classification.is_cognizable}
      Category: ${classification.offence_category}
      BNS Sections: ${classification.bns_sections.join(", ")}
    `;

        const firData = await callLLMForJSON<FIRData>(
            FIR_GENERATION_PROMPT,
            promptContext
        );

        if (sessionId) {
            // Fire-and-forget save to DB
            complaintRepository
                .updateComplaintWithFir(sessionId, firData)
                .catch((err) =>
                    console.error("[firService] DB operation failed (non-fatal):", err.message)
                );
        }

        return firData;
    },
};
