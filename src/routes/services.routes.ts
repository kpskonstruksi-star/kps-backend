import { Router } from "express";
import { businessService } from "../services/business.service";

export const serviceRouter = Router();

serviceRouter.get("/", (_req, res) => {
  res.json(businessService.getServices());
});
