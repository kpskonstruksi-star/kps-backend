import { Router } from "express";
import { z } from "zod";
import { sendContactMail } from "../services/mail";

const pageContactSchema = z.object({
  source: z.literal("page"),
  name: z.string().trim().min(2),
  phone: z.string().trim().min(8).max(32),
  email: z.string().trim().email(),
  workType: z.string().trim().min(1),
  message: z.string().trim().min(10)
});

const modalContactSchema = z.object({
  source: z.literal("modal"),
  name: z.string().trim().min(2),
  phone: z.string().trim().min(8).max(32),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  workType: z.string().trim().min(1),
  message: z.string().trim().max(4000).optional()
});

const contactSchema = z.discriminatedUnion("source", [pageContactSchema, modalContactSchema]);

export const contactRouter = Router();

contactRouter.post("/", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Data tidak valid",
      errors: parsed.error.flatten()
    });
  }

  const data = parsed.data;
  const payload = {
    name: data.name,
    phone: data.phone,
    workType: data.workType,
    source: data.source,
    email: data.source === "page" ? data.email : data.email || undefined,
    message: data.source === "page" ? data.message : data.message || undefined
  };

  try {
    await sendContactMail(payload);
    return res.status(201).json({
      message: "Permintaan konsultasi telah dikirim. Tim kami akan menghubungi Anda.",
      ok: true
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal mengirim email";
    console.error("[contact]", err);
    return res.status(503).json({
      message: msg,
      ok: false
    });
  }
});
