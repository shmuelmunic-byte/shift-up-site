// ════════════════════════════════════════════════════════════════════════
// Supabase Edge Function · notify-lead
// שולח התראת מייל (דרך Resend) על כל ליד חדש שנכנס לטבלת `leads`.
// מופעל ע"י Database Webhook (INSERT על public.leads).
// הגדרה מלאה: docs/email-notifications-setup.md
// ════════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_TO      = Deno.env.get("NOTIFY_TO")   ?? "shmuelmunic@gmail.com";
const NOTIFY_FROM    = Deno.env.get("NOTIFY_FROM") ?? "Shift Up Leads <onboarding@resend.dev>";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? ""; // אופציונלי — אם מוגדר, חובה התאמה

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

serve(async (req) => {
  try {
    // אימות סוד אופציונלי (מונע קריאות זרות)
    if (WEBHOOK_SECRET && req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
      return new Response("forbidden", { status: 403 });
    }
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "missing RESEND_API_KEY" }), { status: 500 });
    }

    const payload = await req.json().catch(() => ({}));
    // Database Webhook שולח { type, table, record, ... }; תמיכה גם בקריאה ישירה
    const lead = payload.record ?? payload;
    const { name, phone, business, message, source, created_at } = lead ?? {};

    if (!name && !phone) {
      return new Response(JSON.stringify({ ok: false, error: "no lead data" }), { status: 400 });
    }

    const waDigits = String(phone ?? "").replace(/\D/g, "").replace(/^0/, "972");
    const when = created_at
      ? new Date(created_at).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })
      : new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

    const html = `
      <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#0c1118">
        <div style="background:#0c1118;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">
          <div style="color:#34d97b;font-size:12px;font-weight:bold;letter-spacing:.1em">ליד חדש · SHIFT UP</div>
          <div style="font-size:22px;font-weight:900;margin-top:4px">${esc(name) || "ללא שם"}</div>
        </div>
        <div style="background:#f4f7fb;padding:22px 24px;border-radius:0 0 14px 14px;line-height:1.7">
          <table style="width:100%;font-size:15px">
            <tr><td style="color:#6b7d92;width:90px">טלפון</td><td><strong>${esc(phone) || "—"}</strong></td></tr>
            <tr><td style="color:#6b7d92">תחום</td><td>${esc(business) || "—"}</td></tr>
            <tr><td style="color:#6b7d92;vertical-align:top">הודעה</td><td>${esc(message) || "—"}</td></tr>
            <tr><td style="color:#6b7d92">מקור</td><td>${esc(source) || "form"}</td></tr>
            <tr><td style="color:#6b7d92">מתי</td><td>${esc(when)}</td></tr>
          </table>
          <div style="margin-top:18px">
            <a href="https://wa.me/${waDigits}" style="display:inline-block;background:#25955a;color:#fff;text-decoration:none;padding:11px 22px;border-radius:10px;font-weight:bold">פתח שיחה בוואטסאפ</a>
            <a href="https://www.shiftup.marketing/admin" style="display:inline-block;color:#117a41;text-decoration:none;padding:11px 16px;font-weight:bold">צפה ב-/admin</a>
          </div>
        </div>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        subject: `📥 ליד חדש: ${name ?? phone}`,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return new Response(JSON.stringify({ ok: false, error: "resend failed", detail }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});
