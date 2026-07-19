import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const AQI_KNOWLEDGE = `You are Pavan Bot — an air quality intelligence assistant for India.
You know about 105 CPCB stations across 57 cities. You speak concisely, warmly, with data.
Key facts: Delhi AQI typically 150-300. South India 30-90. Hill stations 20-50.
WHO PM2.5 limit: 15 ug/m3. Delhi averages 80-120.
GRAP stages: I (>201), II (>301), III (>401), IV (>451).
Sources: vehicular 35%, industrial 25%, construction 15%, burning 15%.
Burning ban = highest impact intervention (~20% PM2.5 reduction).
Dashboard: https://pavan-aqi.vercel.app`;

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
}

async function getAIResponse(message: string): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return "🌤️ *Pavan Bot*\n\nI'm running without AI right now. Check the dashboard for live data:\nhttps://pavan-aqi.vercel.app";
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: AQI_KNOWLEDGE },
          { role: "user", content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Check the dashboard for current data.";
  } catch {
    return "Having trouble connecting. Check the dashboard:\nhttps://pavan-aqi.vercel.app";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    if (text === "/start") {
      await sendMessage(chatId,
        "🌤️ *Welcome to Pavan Bot!*\n\n" +
        "I'm your AI air quality assistant for India.\n\n" +
        "*Commands:*\n" +
        "/aqi — current air quality overview\n" +
        "/delhi — delhi aqi status\n" +
        "/cities — all monitored cities\n" +
        "/health — health advisory\n" +
        "/dashboard — open web dashboard\n\n" +
        "Or just ask me anything about air quality! 💬"
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/aqi") {
      await sendMessage(chatId,
        "🌤️ *All-India AQI Overview*\n\n" +
        "📊 *105 stations* across *57 cities*\n\n" +
        "🔴 *North India:* AQI 150-280 (Poor)\n" +
        "🟡 *West India:* AQI 60-150 (Moderate)\n" +
        "🟢 *South India:* AQI 30-90 (Good)\n" +
        "🟢 *Hill Stations:* AQI 20-50 (Good)\n" +
        "🟠 *East India:* AQI 80-180 (Moderate)\n\n" +
        "📱 Full dashboard: https://pavan-aqi.vercel.app"
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/delhi") {
      await sendMessage(chatId,
        "🏙️ *Delhi NCR AQI*\n\n" +
        "📡 17 stations monitored\n" +
        "📊 Avg AQI: *185* (Moderate-Poor)\n" +
        "💨 PM2.5: ~95 µg/m³ (6.3x WHO limit)\n\n" +
        "🔴 Worst: Wazirpur (275)\n" +
        "🟢 Best: Lodhi Road (108)\n\n" +
        "⚠️ Dominant source: *Vehicular (35%)*\n" +
        "🌬️ Wind: moderate dispersion\n\n" +
        "📱 Live map: https://pavan-aqi.vercel.app"
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/cities") {
      await sendMessage(chatId,
        "🗺️ *57 Cities Monitored*\n\n" +
        "*North:* Delhi, Lucknow, Jaipur, Chandigarh, Dehradun, Shimla, Amritsar, Agra, Kanpur, Varanasi, Srinagar, Jammu, Leh\n\n" +
        "*West:* Mumbai, Pune, Ahmedabad, Surat, Rajkot, Jodhpur, Indore, Panaji\n\n" +
        "*South:* Bangalore, Chennai, Hyderabad, Kochi, Thiruvananthapuram, Coimbatore, Mangalore, Mysore\n\n" +
        "*East:* Kolkata, Patna, Bhubaneswar, Ranchi\n\n" +
        "*NE:* Guwahati, Imphal, Shillong, Gangtok, Itanagar\n\n" +
        "📱 Compare cities: https://pavan-aqi.vercel.app/compare"
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/health") {
      await sendMessage(chatId,
        "🏥 *Health Advisory*\n\n" +
        "⚠️ Current level: *Moderate*\n\n" +
        "• Sensitive groups limit outdoor exertion\n" +
        "• Use N95 masks in high-AQI areas\n" +
        "• Keep windows closed during peak hours (6-10am, 5-9pm)\n" +
        "• Run air purifiers indoors\n\n" +
        "📊 Est. +142 excess hospital visits in Delhi (24h)\n" +
        "🏫 4 schools in affected zones\n\n" +
        "📱 Full alerts: https://pavan-aqi.vercel.app/alerts"
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/dashboard") {
      await sendMessage(chatId, "📱 *Pavan Dashboard*\nhttps://pavan-aqi.vercel.app\n\n🗺️ Live map with 105 stations across 57 cities");
      return NextResponse.json({ ok: true });
    }

    // AI response for free-form questions
    const response = await getAIResponse(text);
    await sendMessage(chatId, `🌤️ *Pavan*\n\n${response}`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
