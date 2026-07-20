import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, city, language } = await req.json();

    const advisories: Record<string, Record<string, string>> = {
      en: {
        moderate: "⚠️ *Pavan AQI Alert*\n\nAir quality is *moderate* in {city}. Sensitive groups should limit outdoor exertion.\n\n• Use N95 masks in high-AQI areas\n• Keep windows closed 6-10am, 5-9pm\n• Run air purifiers indoors\n\n📊 Dashboard: pavan-aqi.vercel.app\n🤖 Bot: @PavanETbot",
        poor: "🟠 *Pavan AQI Alert — POOR*\n\nAir quality is *poor* in {city}. Avoid outdoor exercise. Use masks.\n\n• PM2.5 exceeds WHO limit by 6x\n• Schools should limit outdoor activities\n• Est. +142 excess hospital visits/day\n\n📊 pavan-aqi.vercel.app",
      },
      hi: {
        moderate: "⚠️ *पवन वायु गुणवत्ता अलर्ट*\n\n{city} में हवा की गुणवत्ता *मध्यम* है। संवेदनशील लोग बाहर रहने से बचें।\n\n• N95 मास्क पहनें\n• खिड़कियाँ बंद रखें\n• एयर प्यूरीफायर चलाएं\n\n📊 pavan-aqi.vercel.app",
        poor: "🟠 *पवन अलर्ट — खराब*\n\n{city} में हवा *खराब* है। बाहर व्यायाम न करें।\n\n• PM2.5 WHO सीमा से 6 गुना अधिक\n• स्कूलों में बाहरी गतिविधि सीमित करें\n\n📊 pavan-aqi.vercel.app",
      },
      ta: {
        moderate: "⚠️ *பவன் காற்றுத்தர எச்சரிக்கை*\n\n{city} காற்றுத்தரம் *மிதமாக* உள்ளது.\n\n📊 pavan-aqi.vercel.app",
        poor: "🟠 *பவன் எச்சரிக்கை — மோசம்*\n\n{city} காற்று *மோசமாக* உள்ளது.\n\n📊 pavan-aqi.vercel.app",
      },
      bn: {
        moderate: "⚠️ *পবন বায়ু মান সতর্কতা*\n\n{city} বাতাসের মান *মাঝারি*।\n\n📊 pavan-aqi.vercel.app",
        poor: "🟠 *পবন সতর্কতা — খারাপ*\n\n{city} বাতাস *খারাপ*।\n\n📊 pavan-aqi.vercel.app",
      },
    };

    const lang = language || "en";
    const level = "moderate";
    const template = advisories[lang]?.[level] || advisories.en[level];
    const message = template.replace(/\{city\}/g, city || "Delhi");

    return NextResponse.json({
      success: true,
      phone: phone || "demo",
      message,
      language: lang,
      city: city || "Delhi",
      delivery_method: "whatsapp_business_api",
      status: "message_generated",
      note: "In production, this sends via WhatsApp Business API. For demo, the formatted message is returned for broadcast.",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
