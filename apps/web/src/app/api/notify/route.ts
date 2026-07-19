import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

function generateAlertEmail(data: {
  city: string;
  aqi: number;
  level: string;
  stations: number;
  headline: string;
  recommendations: string[];
}) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f0e6; padding: 32px;">
      <div style="background: white; border-radius: 28px; padding: 32px; margin-bottom: 16px;">
        <h1 style="font-size: 24px; margin: 0 0 4px 0; color: #1a1a18;">pavan.</h1>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: #6b6a64; margin: 0;">air quality alert</p>
      </div>

      <div style="background: ${data.aqi > 300 ? '#ef4444' : data.aqi > 200 ? '#fb923c' : '#eab308'}; border-radius: 28px; padding: 32px; color: ${data.aqi > 200 ? 'white' : '#1a1a18'}; margin-bottom: 16px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; opacity: 0.7; margin: 0 0 8px 0;">aqi alert — ${data.city.toLowerCase()}</p>
        <p style="font-size: 72px; font-weight: 700; margin: 0; line-height: 0.9;">${data.aqi}</p>
        <p style="font-size: 16px; margin: 8px 0 0 0; opacity: 0.8;">${data.level.toLowerCase()} · ${data.stations} stations monitored</p>
      </div>

      <div style="background: white; border-radius: 28px; padding: 32px; margin-bottom: 16px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: #6b6a64; margin: 0 0 12px 0;">summary</p>
        <p style="font-size: 15px; color: #1a1a18; line-height: 1.5; margin: 0;">${data.headline.toLowerCase()}</p>
      </div>

      ${data.recommendations.length > 0 ? `
      <div style="background: white; border-radius: 28px; padding: 32px; margin-bottom: 16px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: #6b6a64; margin: 0 0 12px 0;">enforcement recommendations</p>
        ${data.recommendations.map(r => `<p style="font-size: 13px; color: #1a1a18; margin: 0 0 8px 0; padding-left: 12px; border-left: 3px solid #fb923c;">${r.toLowerCase()}</p>`).join('')}
      </div>
      ` : ''}

      <div style="text-align: center; padding: 16px;">
        <a href="https://web-chi-five-95.vercel.app" style="display: inline-block; background: #1a1a18; color: #f5f0e6; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-size: 13px;">open pavan dashboard</a>
      </div>

      <p style="text-align: center; font-size: 10px; color: #6b6a64; margin-top: 16px;">
        powered by pavan ai · 105 stations · 57 cities · et ai hackathon 2026
      </p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, to, city, aqi, level, headline, recommendations } = body;

    if (action === "send_alert") {
      const html = generateAlertEmail({
        city: city || "Delhi",
        aqi: aqi || 185,
        level: level || "Moderate",
        stations: 105,
        headline: headline || "Air quality moderate across monitoring stations.",
        recommendations: recommendations || [],
      });

      const subject = `Pavan AQI Alert — ${city || "Delhi"} (AQI ${aqi || 185})`;
      const recipient = to || SMTP_USER;

      if (SMTP_USER && SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        await transporter.sendMail({
          from: `"Pavan AI" <${SMTP_USER}>`,
          to: recipient,
          subject,
          html,
        });

        return NextResponse.json({
          success: true,
          sent: true,
          message: `Alert email sent to ${recipient}`,
          subject,
        });
      }

      return NextResponse.json({
        success: true,
        sent: false,
        message: "Email generated but SMTP not configured",
        preview_html: html,
        subject,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Failed: " + String(e) }, { status: 500 });
  }
}
