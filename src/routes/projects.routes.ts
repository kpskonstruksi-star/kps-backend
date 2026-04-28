import { Router } from "express";
import { projectService } from "../services/project.service";

export const projectRouter = Router();

projectRouter.get("/", (_req, res) => {
  res.json(projectService.getAll());
});
