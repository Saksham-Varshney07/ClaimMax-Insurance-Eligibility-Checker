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

        const esicClaim = claims.find((c) => c.scheme === "ESIC" && c.eligible);
        const pmjayClaim = claims.find((c) => c.scheme === "PMJAY" && c.eligible);

        // Generate eligible PDFs in parallel
        const [esicResult, pmjayResult] = await Promise.all([
            esicClaim
                ? generateEsicPdf({ billData, claim: { ...esicClaim, scheme: "ESIC" }, user }).then((filePath) => ({
                    url: `/docs/${path.basename(filePath)}`,
                    id: esicClaim.id,
                }))
                : null,
            pmjayClaim
                ? generatePmjayPdf({ billData, claim: { ...pmjayClaim, scheme: "PMJAY" }, user }).then((filePath) => ({
                    url: `/docs/${path.basename(filePath)}`,
                    id: pmjayClaim.id,
                }))
                : null,
        ]);

        // Persist pdfUrls in parallel
        await Promise.all([
            esicResult ? claimRepository.updateClaimPdfUrl(esicResult.id, esicResult.url) : null,
            pmjayResult ? claimRepository.updateClaimPdfUrl(pmjayResult.id, pmjayResult.url) : null,
        ]);

        res.status(200).json({
            esicPdfUrl: esicResult?.url ?? null,
            pmjayPdfUrl: pmjayResult?.url ?? null,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[generateDocs]", err);
        res.status(500).json({ error: "Failed to generate documents", details: message });
    }
}
