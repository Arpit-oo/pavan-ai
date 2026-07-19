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
  const aqiColor = data.aqi > 300 ? '#dc2626' : data.aqi > 200 ? '#ea580c' : data.aqi > 100 ? '#d97706' : '#16a34a';
  const aqiFgColor = data.aqi > 200 ? '#ffffff' : '#1a1a18';
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f5f0e6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f0e6; padding: 40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%;">

        <!-- Header -->
        <tr><td style="padding: 0 0 24px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden;">
            <tr><td style="padding: 28px 32px;">
              <table width="100%"><tr>
                <td><span style="font-size: 22px; font-weight: 700; color: #1a1a18;">pavan</span><span style="color: ${aqiColor}; font-size: 22px;">.</span></td>
                <td align="right"><span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #9a9890;">air quality intelligence</span></td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>

        <!-- AQI Hero -->
        <tr><td style="padding: 0 0 16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: ${aqiColor}; border-radius: 20px; overflow: hidden;">
            <tr><td style="padding: 36px 32px;">
              <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; color: ${aqiFgColor}; opacity: 0.7; margin: 0 0 12px 0;">aqi alert &mdash; ${data.city.toLowerCase()}</p>
              <table width="100%"><tr>
                <td><span style="font-size: 80px; font-weight: 700; color: ${aqiFgColor}; line-height: 0.85; letter-spacing: -0.03em;">${data.aqi}</span></td>
                <td align="right" valign="bottom" style="padding-bottom: 8px;">
                  <span style="display: inline-block; background: rgba(255,255,255,0.2); color: ${aqiFgColor}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; padding: 6px 14px; border-radius: 20px;">${data.level.toLowerCase()}</span>
                </td>
              </tr></table>
              <p style="font-size: 13px; color: ${aqiFgColor}; opacity: 0.7; margin: 12px 0 0 0;">${data.stations} stations monitored &middot; ${time} IST</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Summary -->
        <tr><td style="padding: 0 0 16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden;">
            <tr><td style="padding: 28px 32px;">
              <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #9a9890; margin: 0 0 12px 0;">executive summary</p>
              <p style="font-size: 15px; color: #1a1a18; line-height: 1.6; margin: 0;">${data.headline}</p>
              <p style="font-size: 11px; color: #9a9890; margin: 16px 0 0 0;">${date}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Key Metrics -->
        <tr><td style="padding: 0 0 16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="padding-right: 8px;">
                <table width="100%" style="background: #ffffff; border-radius: 20px;"><tr><td style="padding: 20px 16px; text-align: center;">
                  <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #9a9890; margin: 0 0 6px 0;">pm2.5</p>
                  <p style="font-size: 28px; font-weight: 700; color: ${aqiColor}; margin: 0;">${Math.round(data.aqi * 0.52)}</p>
                  <p style="font-size: 10px; color: #9a9890; margin: 4px 0 0 0;">ug/m3</p>
                </td></tr></table>
              </td>
              <td width="33%" style="padding: 0 4px;">
                <table width="100%" style="background: #ffffff; border-radius: 20px;"><tr><td style="padding: 20px 16px; text-align: center;">
                  <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #9a9890; margin: 0 0 6px 0;">who limit</p>
                  <p style="font-size: 28px; font-weight: 700; color: #1a1a18; margin: 0;">${(data.aqi * 0.52 / 15).toFixed(1)}x</p>
                  <p style="font-size: 10px; color: #9a9890; margin: 4px 0 0 0;">over limit</p>
                </td></tr></table>
              </td>
              <td width="33%" style="padding-left: 8px;">
                <table width="100%" style="background: #ffffff; border-radius: 20px;"><tr><td style="padding: 20px 16px; text-align: center;">
                  <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #9a9890; margin: 0 0 6px 0;">cities</p>
                  <p style="font-size: 28px; font-weight: 700; color: #1a1a18; margin: 0;">57</p>
                  <p style="font-size: 10px; color: #9a9890; margin: 4px 0 0 0;">monitored</p>
                </td></tr></table>
              </td>
            </tr>
          </table>
        </td></tr>

        ${data.recommendations.length > 0 ? `
        <!-- Recommendations -->
        <tr><td style="padding: 0 0 16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden;">
            <tr><td style="padding: 28px 32px;">
              <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #9a9890; margin: 0 0 16px 0;">enforcement recommendations</p>
              ${data.recommendations.map((r, i) => `
              <table width="100%" style="margin-bottom: 12px;"><tr>
                <td width="28" valign="top"><span style="display: inline-block; width: 22px; height: 22px; border-radius: 11px; background: ${aqiColor}15; color: ${aqiColor}; font-size: 11px; font-weight: 600; text-align: center; line-height: 22px;">${i + 1}</span></td>
                <td style="padding-left: 10px;"><p style="font-size: 14px; color: #1a1a18; line-height: 1.5; margin: 0;">${r}</p></td>
              </tr></table>
              `).join('')}
            </td></tr>
          </table>
        </td></tr>
        ` : ''}

        <!-- CTA -->
        <tr><td style="padding: 8px 0 24px 0; text-align: center;">
          <a href="https://pavan-aqi.vercel.app" style="display: inline-block; background: #1a1a18; color: #f5f0e6; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 500;">Open Pavan Dashboard &rarr;</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding: 0; text-align: center;">
          <p style="font-size: 11px; color: #9a9890; margin: 0;">Pavan AI &middot; 105 stations &middot; 57 cities &middot; All India</p>
          <p style="font-size: 10px; color: #c7c3b6; margin: 8px 0 0 0;">ET AI Hackathon 2026 &middot; Problem Statement #5</p>
          <p style="font-size: 10px; color: #c7c3b6; margin: 4px 0 0 0;">You received this alert because you subscribed to Pavan AQI notifications.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
          message: `Alert sent to ${recipient}`,
          subject,
        });
      }

      return NextResponse.json({
        success: true,
        sent: false,
        message: "SMTP not configured",
        preview_html: html,
        subject,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Failed: " + String(e) }, { status: 500 });
  }
}
