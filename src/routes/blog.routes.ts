import { Router } from "express";

export const blogRouter = Router();

blogRouter.get("/", (_req, res) => {
  res.json([
    { id: 1, title: "Tips Bangun Rumah Aman", publishedAt: "2026-04-01" },
    { id: 2, title: "Checklist Renovasi Gedung", publishedAt: "2026-04-05" }
  ]);
});
