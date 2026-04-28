import nodemailer from "nodemailer";

const DEFAULT_INBOX = "kpskonstruksi@gmail.com";

function isPlaceholderPassword(value: string): boolean {
  const t = value.trim();
  if (!t) return true;
  const lower = t.toLowerCase();
  return ["isi_app_password_di_sini", "your_app_password", "xxx", "changeme"].includes(lower);
}

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

function buildPlainText(data: ContactMailInput): string {
  const lines = [
    "Permintaan konsultasi baru dari website KPS Konstruksi",
    "",
    `Nama: ${data.name}`,
    `WhatsApp/Telepon: ${data.phone}`,
    data.email ? `Email: ${data.email}` : "Email: (tidak diisi)",
    `Jenis pekerjaan: ${data.workType}`,
    `Sumber: ${data.source === "page" ? "Form kontak halaman" : "Popup konsultasi"}`,
    "",
    "Pesan / detail:",
    data.message?.trim() || "(tidak ada pesan tambahan)"
  ];
  return lines.join("\n");
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
  const to = (process.env.CONTACT_TO_EMAIL ?? DEFAULT_INBOX).trim();
  const passRaw = (process.env.SMTP_PASS ?? "").trim();
  const pass = isPlaceholderPassword(passRaw) ? "" : passRaw;
  const user =
    (process.env.SMTP_USER ?? "").trim() ||
    (process.env.CONTACT_TO_EMAIL ?? DEFAULT_INBOX).trim() ||
    DEFAULT_INBOX;

  if (!pass) {
    throw new Error(
      "SMTP_PASS belum diisi dengan benar. Buat file backend/.env (salin dari .env.example), " +
        "isi SMTP_PASS dengan Sandi aplikasi Gmail (16 karakter), lalu restart server backend. " +
        "SMTP_USER boleh dikosongkan jika sama dengan " +
        DEFAULT_INBOX +
        "."
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
    tls: { rejectUnauthorized: true }
  });

  const subject = `[KPS] Konsultasi — ${data.name}`;
  const replyTo =
    data.email && data.email.includes("@") ? data.email : undefined;

  const mailFrom = (process.env.MAIL_FROM ?? "").trim();
  const fromHeader =
    mailFrom && mailFrom.includes("@")
      ? mailFrom.includes("<")
        ? mailFrom
        : `"KPS Konstruksi" <${mailFrom}>`
      : `"KPS Konstruksi" <${user}>`;

  await transporter.sendMail({
    from: fromHeader,
    to,
    replyTo,
    subject,
    text: buildPlainText(data),
    html: buildHtml(data)
  });
}
