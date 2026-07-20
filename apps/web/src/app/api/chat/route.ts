import { NextRequest, NextResponse } from "next/server";

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

const SYSTEM_PROMPT = `you are pavan, an ai air quality intelligence assistant for india.
you speak in lowercase, concise, warm but data-driven. like a smart friend who happens to be an environmental scientist.
you have access to air quality monitoring data from 105 stations across 57 indian cities.
you know about GRAP stages, source attribution (vehicular, industrial, construction, burning), intervention simulations, and health impacts.
keep responses under 150 words. use **bold** for key metrics. be helpful and specific.

key facts you know:
- delhi ncr typically has the worst air quality in india (aqi 150-300 range)
- south indian cities (bangalore, chennai, kochi) are generally cleaner (aqi 30-90)
- hill stations (shimla, gangtok, leh) have the best air (aqi 20-50)
- main pollution sources: vehicular (35%), industrial (25%), construction (15%), burning (15%), background (10%)
- who pm2.5 limit is 15 ug/m3. delhi averages 80-120 ug/m3.
- grap stages: I (aqi>201), II (aqi>301), III (aqi>401), IV (aqi>451)
- burning ban has highest single-intervention impact (~20% pm2.5 reduction)
- stagnation (wind <2m/s) traps pollutants and worsens air quality
- monsoon season (jul-sep) significantly improves air quality via washout`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!OPENAI_KEY) {
      return NextResponse.json({
        response: "i'm running without an api key right now. check the dashboard for current aqi data across 105 stations in 57 cities, the map shows everything in real-time.",
      });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({
        response: "having trouble connecting to the ai service right now. try checking the dashboard, it shows live aqi data for all 57 cities.",
      });
    }

    return NextResponse.json({
      response: data.choices[0].message.content,
    });
  } catch {
    return NextResponse.json({
      response: "something went wrong. check the dashboard for current air quality data across india.",
    });
  }
}
