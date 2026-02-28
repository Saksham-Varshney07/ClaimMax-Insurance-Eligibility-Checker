import { Router } from "express";
import { computeClaimsHandler } from "../controllers/claimsController";

const router = Router();

// POST /api/compute-claims
router.post("/compute-claims", computeClaimsHandler);

export default router;
