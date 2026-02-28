import { ClassificationResult, FIRData } from "../types";

export function validateClassifyInput(body: any): string | null {
    if (!body || typeof body.transcript !== "string") {
        return "Transcript is required and must be a string";
    }
    if (body.transcript.trim().length < 10) {
        return "Transcript must be at least 10 characters long";
    }
    if (body.transcript.length > 5000) {
        return "Transcript exceeds maximum length of 5000 characters";
    }
    return null;
}

export function validateGenerateFirInput(body: any): string | null {
    if (!body || !body.transcript || !body.classification) {
        return "Transcript and classification are both required";
    }
    return null;
}

export function validateEscalateInput(body: any): string | null {
    if (!body || !body.firData || !body.classification) {
        return "FIR Data and classification are both required";
    }
    return null;
}
