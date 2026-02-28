import { Router } from "express";
import { generateEscalation } from "../controllers/escalateController";

export const escalateRouter = Router();

escalateRouter.post("/", generateEscalation);
