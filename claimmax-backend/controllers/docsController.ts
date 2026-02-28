import { Request, Response } from "express";
import path from "path";
import { generateEsicPdf, generatePmjayPdf } from "../services/pdfService";
import * as claimRepository from "../repositories/claimRepository";
import { BillData, User } from "../types";

interface Claim {
    id: number;
    scheme: string;
    eligible: boolean;
    amount: number;
    reason: string;
    pdfUrl?: string | null;
}

interface GenerateDocsBody {
    billData: BillData;
    claims: Claim[];
    caseId: number;
    user: User;
}

/**
 * POST /api/generate-docs
 * Body: { billData, claims, caseId, user }
 * Returns: { esicPdfUrl, pmjayPdfUrl }
 */
export async function generateDocs(req: Request, res: Response): Promise<void> {
    try {
        const { billData, claims, caseId, user } = req.body as GenerateDocsBody;

        if (!billData || !claims || !caseId || !user) {
            res.status(400).json({ error: "Missing required fields: billData, claims, caseId, user" });
            return;
        }

        let esicPdfUrl: string | null = null;
        let pmjayPdfUrl: string | null = null;

        for (const claim of claims) {
            if (!claim.eligible) continue;

            if (claim.scheme === "ESIC") {
                const filePath = await generateEsicPdf({ billData, claim: { ...claim, scheme: "ESIC" }, user });
                const filename = path.basename(filePath);
                esicPdfUrl = `/docs/${filename}`;
                await claimRepository.updateClaimPdfUrl(claim.id, esicPdfUrl);
            }

            if (claim.scheme === "PMJAY") {
                const filePath = await generatePmjayPdf({ billData, claim: { ...claim, scheme: "PMJAY" }, user });
                const filename = path.basename(filePath);
                pmjayPdfUrl = `/docs/${filename}`;
                await claimRepository.updateClaimPdfUrl(claim.id, pmjayPdfUrl);
            }
        }

        res.status(200).json({ esicPdfUrl, pmjayPdfUrl });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[generateDocs]", err);
        res.status(500).json({ error: "Failed to generate documents", details: message });
    }
}
