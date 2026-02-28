import { Router } from "express";
import { generateFir } from "../controllers/generateFirController";

export const generateFirRouter = Router();

generateFirRouter.post("/", generateFir);
