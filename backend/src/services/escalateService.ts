import { ESCALATION_PROMPT } from "../lib/prompts";
import { callLLMForJSON } from "../lib/llm";
import { complaintRepository } from "../repositories/complaintRepository";
import { ClassificationResult, FIRData, EscalationDocs } from "../types";

export const escalateService = {
    async generateEscalationDocs(
        firData: FIRData,
        classification: ClassificationResult,
        refusalDetails?: string,
        sessionId?: string
    ): Promise<EscalationDocs> {
        const promptContext = `
      FIR Data:
      ${JSON.stringify(firData, null, 2)}

      Classification Details:
      Is Cognizable: ${classification.is_cognizable}
      Category: ${classification.offence_category}
      BNS Sections: ${classification.bns_sections.join(", ")}

      Refusal Details (if any provided):
      ${refusalDetails || "No specific details provided."}
    `;

        const escalationDocs = await callLLMForJSON<EscalationDocs>(
            ESCALATION_PROMPT,
            promptContext
        );

        if (sessionId) {
            // Fire-and-forget update to DB
            complaintRepository
                .updateComplaintStatus(sessionId, "escalated")
                .catch((err) =>
                    console.error("[escalateService] DB operation failed (non-fatal):", err.message)
                );
        }

        return escalationDocs;
    },
};
