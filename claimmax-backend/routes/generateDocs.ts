import { Router } from "express";
import { generateDocs } from "../controllers/docsController";

const router = Router();

// POST /api/generate-docs
router.post("/generate-docs", generateDocs);

export default router;
