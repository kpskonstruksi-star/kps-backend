import { Router } from "express";
import { blogRouter } from "./blog.routes";
import { contactRouter } from "./contact.routes";
import { projectRouter } from "./projects.routes";
import { serviceRouter } from "./services.routes";

export const apiRouter = Router();

apiRouter.use("/projects", projectRouter);
apiRouter.use("/services", serviceRouter);
apiRouter.use("/blog", blogRouter);
apiRouter.use("/contact", contactRouter);

// ✅ TAMBAHAN INI
apiRouter.get("/data", (req, res) => {
  res.json({
    message: "Halo dari backend 🚀",
    status: "success"
  });
});