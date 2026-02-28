import { Request, Response } from "express";
import { computeClaims } from "../services/rulesEngine";
import * as claimRepository from "../repositories/claimRepository";
import { BillData, CoverageFlags } from "../types";

interface ComputeClaimsBody {
    billData: BillData;
    caseId: number;
    flags: CoverageFlags;
}

/**
 * POST /api/compute-claims
 * Body: { billData, caseId, flags: { hasPmjay, hasEsic, hasGroupPolicy } }
 * Returns: { claims }
 */
export async function computeClaimsHandler(req: Request, res: Response): Promise<void> {
    try {
        const { billData, caseId, flags } = req.body as ComputeClaimsBody;

        if (!billData || !caseId || !flags) {
            res.status(400).json({ error: "Missing required fields: billData, caseId, flags" });
            return;
        }

        if (
            typeof flags.hasPmjay === "undefined" ||
            typeof flags.hasEsic === "undefined" ||
            typeof flags.hasGroupPolicy === "undefined"
        ) {
            res.status(400).json({ error: "flags must include hasPmjay, hasEsic, and hasGroupPolicy" });
            return;
        }

        const claimsData = computeClaims(billData, flags);
        const savedClaims = await claimRepository.createClaims(caseId, claimsData);

        res.status(200).json({ claims: savedClaims });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[computeClaims]", err);
        res.status(500).json({ error: "Failed to compute claims", details: message });
    }
}
