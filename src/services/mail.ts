import { Resend } from "resend";

const DEFAULT_INBOX = "kpskonstruksi@gmail.com";

export type ContactMailInput = {
  name: string;
  phone: string;
  email?: string;
  workType: string;
  message?: string;
  source: "page" | "modal";
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(data: ContactMailInput): string {
  const msg = data.message?.trim() || "(tidak ada pesan tambahan)";
  return `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8" /></head>
<body style="font-family:Segoe UI,sans-serif;line-height:1.6;color:#162036;">
  <h2 style="color:#1593cb;margin:0 0 16px;">Konsultasi baru</h2>
  <table style="border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 12px 6px 0;color:#637088;">Nama</td><td><strong>${escapeHtml(data.name)}</strong></td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#637088;">WhatsApp/Telepon</td><td>${escapeHtml(data.phone)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#637088;">Email</td><td>${data.email ? escapeHtml(data.email) : "—"}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#637088;">Jenis pekerjaan</td><td>${escapeHtml(data.workType)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#637088;">Sumber</td><td>${data.source === "page" ? "Form kontak" : "Popup konsultasi"}</td></tr>
  </table>
  <p style="margin:20px 0 8px;color:#637088;font-size:13px;">Pesan / kebutuhan proyek</p>
  <div style="background:#f0f6fb;border:1px solid #d8eaf5;border-radius:8px;padding:14px;white-space:pre-wrap;">${escapeHtml(msg)}</div>
</body>
</html>`;
}

export async function sendContactMail(data: ContactMailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY ?? "";
  if (!apiKey) {
    throw new Error("RESEND_API_KEY belum diisi di environment variables.");
  }

  const resend = new Resend(apiKey);
  const to = (process.env.CONTACT_TO_EMAIL ?? DEFAULT_INBOX).trim();

  const { error } = await resend.emails.send({
    from: "KPS Konstruksi <onboarding@resend.dev>",
    to,
    replyTo: data.email && data.email.includes("@") ? data.email : undefined,
    subject: `[KPS] Konsultasi — ${data.name}`,
    html: buildHtml(data),
  });

  if (error) {
    throw new Error(error.message);
  }
}