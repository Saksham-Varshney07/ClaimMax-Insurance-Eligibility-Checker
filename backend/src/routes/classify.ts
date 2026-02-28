import { Router } from "express";
import { classifyIncident } from "../controllers/classifyController";

export const classifyRouter = Router();

classifyRouter.post("/", classifyIncident);
