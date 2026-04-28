import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiRouter } from "./routes";

/** Muat .env dari folder backend (bukan hanya cwd), supaya SMTP terbaca saat `npm run dev` dari mana pun. */
function loadEnvFiles() {
  const cwd = process.cwd();
  const paths: string[] = [path.resolve(__dirname, "..", ".env")];
  if (path.basename(cwd) !== "backend") {
    paths.push(path.join(cwd, "backend", ".env"));
  }
  paths.push(path.join(cwd, ".env"));
  for (const p of paths) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
    }
  }
}

loadEnvFiles();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin: frontendUrl }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "kps-backend" });
});

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`KPS backend running at http://localhost:${port}`);
});
