// ─── City-specific mock data for 5 cities ───
// Each function takes a city name and returns realistic, differentiated data.

interface AlertData {
  city: string;
  alerts: {
    avg_aqi: number; level: string; alert_count: number;
    city_advisory: Record<string, string>;
    zone_alerts: Array<{ station: string; aqi: number; level: string; message_en: string; message_hi: string }>;
    whatsapp_message: Record<string, string>;
    languages: string[];
  };
}

interface HealthImpact {
  avg_aqi: number; avg_pm25: number; who_pm25_limit: number; excess_over_who: number;
  total_population: number; estimated_excess_hospital_visits_24h: number;
  schools_in_affected_zones: number; hospitals_nearby: number;
}

interface GRAPStatus {
  city: string; avg_aqi: number; total_stations: number;
  stations_exceeding_poor: number; stations_exceeding_severe: number;
  grap_stage: string | null; grap_details: null;
  all_stages: Record<string, { name: string; trigger_aqi: number; color: string; actions: string[] }>;
}

interface ComplianceReport {
  title: string; period: string;
  executive_summary: { overall_status: string; avg_aqi: number; max_aqi: number; stations_monitored: number; hotspots_detected: number; anomalies_flagged: number; dominant_pollution_source: string; weather_outlook: string; headline: string; };
  grap_compliance: { current_stage: string | null; required_actions: string[]; };
  enforcement_recommendations: Array<{ priority: number; action: string; urgency: string }>;
  attribution_summary: Record<string, number>;
  disclaimer?: string;
}

interface AgentLog { timestamp: string; agent: string; message: string; }

interface AnalysisSummary {
  status: string; urgency: string; avg_aqi: number; max_aqi: number;
  station_count: number; hotspot_count: number; anomaly_count: number;
  critical_anomalies: number; dominant_source: string; pollution_outlook: string;
  wind_speed: number; stagnation: boolean; grap_stage: string | null;
  headline: string; enforcement_recs: number;
}

interface StationImpact {
  station_name: string;
  before: { aqi: number; pm25: number };
  after: { aqi: number; pm25: number };
  reduction: { aqi_points: number; aqi_pct: number; pm25_pct: number };
}

// ─── Shared GRAP stages (Delhi-NCR policy, shown for reference in all cities) ───

const GRAP_ALL_STAGES: Record<string, { name: string; trigger_aqi: number; color: string; actions: string[] }> = {
  I: {
    name: "Stage I - Poor",
    trigger_aqi: 201,
    color: "#FF9800",
    actions: [
      "Stop garbage burning in landfills",
      "Enforce dust control at construction sites",
      "Water sprinkling on roads with heavy traffic",
      "Strictly enforce PUC norms for vehicles",
    ],
  },
  II: {
    name: "Stage II - Very Poor",
    trigger_aqi: 301,
    color: "#F44336",
    actions: [
      "Ban use of coal/firewood in tandoors",
      "Enhance parking fees to discourage private vehicles",
      "Augment CNG/electric bus services",
      "Shut down brick kilns and stone crushers",
    ],
  },
  III: {
    name: "Stage III - Severe",
    trigger_aqi: 401,
    color: "#9C27B0",
    actions: [
      "Ban construction and demolition activities",
      "Shut down industries using non-clean fuels",
      "Enforce strict ban on BS-III petrol and BS-IV diesel vehicles",
      "State govts to decide on school closures",
    ],
  },
  IV: {
    name: "Stage IV - Severe+",
    trigger_aqi: 451,
    color: "#4A148C",
    actions: [
      "Stop entry of trucks except essential services",
      "Ban all construction and demolition work",
      "Implement odd-even vehicle rationing",
      "Close schools and shift to online classes",
    ],
  },
};

// ─── Helper to determine alert level from AQI ───

function aqiLevel(aqi: number): string {
  if (aqi < 50) return "good";
  if (aqi < 100) return "moderate";
  if (aqi < 200) return "poor";
  if (aqi < 300) return "very_poor";
  return "severe";
}

// ═══════════════════════════════════════════════════════
//  ALERT DATA
// ═══════════════════════════════════════════════════════

const alertDataMap: Record<string, AlertData> = {
  Delhi: {
    city: "Delhi",
    alerts: {
      avg_aqi: 185,
      level: "poor",
      alert_count: 8,
      city_advisory: {
        en: "Delhi air quality is POOR (AQI 185). Sensitive groups should limit outdoor activity. Masks recommended near Anand Vihar and Mundka. GRAP Stage I measures are active.",
        hi: "दिल्ली की वायु गुणवत्ता खराब है (AQI 185)। संवेदनशील समूहों को बाहरी गतिविधि सीमित करनी चाहिए। आनंद विहार और मुंडका के पास मास्क पहनें। GRAP चरण I लागू है।",
        ta: "டெல்லி காற்றின் தரம் மோசமாக உள்ளது (AQI 185). உணர்திறன் குழுக்கள் வெளிப்புற நடவடிக்கைகளை குறைக்கவும். ஆனந்த் விஹார் மற்றும் முண்ட்கா அருகே முகக்கவசம் அணியவும்.",
        bn: "দিল্লির বায়ুর মান খারাপ (AQI ১৮৫)। সংবেদনশীল গোষ্ঠীর বাইরের কার্যকলাপ সীমিত করা উচিত। আনন্দ বিহার ও মুণ্ডকা এলাকায় মাস্ক পরুন। GRAP পর্যায় I সক্রিয়।",
      },
      zone_alerts: [
        { station: "Anand Vihar", aqi: 267, level: "very_poor", message_en: "Very Poor AQI at Anand Vihar (267). Avoid outdoor exercise.", message_hi: "आनंद विहार में बहुत खराब AQI (267)। बाहरी व्यायाम से बचें।" },
        { station: "Wazirpur", aqi: 275, level: "very_poor", message_en: "Very Poor AQI at Wazirpur (275). Industrial emissions elevated.", message_hi: "वज़ीरपुर में बहुत खराब AQI (275)। औद्योगिक उत्सर्जन बढ़ा हुआ है।" },
        { station: "Mundka", aqi: 232, level: "very_poor", message_en: "Very Poor AQI at Mundka (232). Dust and vehicular emissions high.", message_hi: "मुंडका में बहुत खराब AQI (232)। धूल और वाहन उत्सर्जन अधिक है।" },
        { station: "Narela", aqi: 248, level: "very_poor", message_en: "Very Poor AQI at Narela (248). Crop residue burning detected nearby.", message_hi: "नरेला में बहुत खराब AQI (248)। पराली जलाने का प्रभाव दिखा।" },
        { station: "RK Puram", aqi: 273, level: "very_poor", message_en: "Very Poor AQI at RK Puram (273). Traffic congestion contributing.", message_hi: "आरके पुरम में बहुत खराब AQI (273)। यातायात भीड़ से प्रदूषण बढ़ा।" },
        { station: "ITO", aqi: 210, level: "very_poor", message_en: "Very Poor AQI at ITO (210). Vehicular hotspot.", message_hi: "आईटीओ में बहुत खराब AQI (210)। वाहन प्रदूषण का हॉटस्पॉट।" },
        { station: "JLN Stadium", aqi: 262, level: "very_poor", message_en: "Very Poor AQI at JLN Stadium (262). Reduce outdoor sports.", message_hi: "जेएलएन स्टेडियम में बहुत खराब AQI (262)। बाहरी खेल कम करें।" },
        { station: "Rohini", aqi: 244, level: "very_poor", message_en: "Very Poor AQI at Rohini (244). Construction dust elevated.", message_hi: "रोहिणी में बहुत खराब AQI (244)। निर्माण धूल बढ़ी हुई है।" },
      ],
      whatsapp_message: {
        en: "Delhi Air Quality Alert\nAQI: 185 (Poor)\nGRAP Stage I Active\n\nHotspots:\n- Anand Vihar: 267\n- Wazirpur: 275\n- Mundka: 232\n- Narela: 248\n- RK Puram: 273\n\nSensitive groups should limit outdoor activity. Masks recommended in hotspot areas.",
        hi: "दिल्ली वायु गुणवत्ता अलर्ट\nAQI: 185 (खराब)\nGRAP चरण I सक्रिय\n\nहॉटस्पॉट:\n- आनंद विहार: 267\n- वज़ीरपुर: 275\n- मुंडका: 232\n- नरेला: 248\n- आरके पुरम: 273\n\nसंवेदनशील समूह बाहरी गतिविधि सीमित करें।",
        ta: "டெல்லி காற்றுத்தர எச்சரிக்கை\nAQI: 185 (மோசம்)\nGRAP நிலை I செயலில்\n\nஹாட்ஸ்பாட்:\n- ஆனந்த் விஹார்: 267\n- வஜீர்புர்: 275\n- முண்ட்கா: 232\n- நரேலா: 248\n\nஉணர்திறன் குழுக்கள் வெளிப்புற நடவடிக்கையை குறைக்கவும்.",
        bn: "দিল্লি বায়ু মান সতর্কতা\nAQI: ১৮৫ (খারাপ)\nGRAP পর্যায় I সক্রিয়\n\nহটস্পট:\n- আনন্দ বিহার: ২৬৭\n- ওয়াজিরপুর: ২৭৫\n- মুণ্ডকা: ২৩২\n- নরেলা: ২৪৮\n\nসংবেদনশীল গোষ্ঠী বাইরের কার্যকলাপ সীমিত করুন।",
      },
      languages: ["en", "hi", "ta", "bn"],
    },
  },

  Mumbai: {
    city: "Mumbai",
    alerts: {
      avg_aqi: 105,
      level: "moderate",
      alert_count: 2,
      city_advisory: {
        en: "Mumbai air quality is MODERATE (AQI 105). Generally acceptable. Unusually sensitive individuals may experience respiratory symptoms near Colaba and Kurla industrial zones.",
        hi: "मुंबई की वायु गुणवत्ता मध्यम है (AQI 105)। सामान्यतः स्वीकार्य। कोलाबा और कुर्ला औद्योगिक क्षेत्रों के पास संवेदनशील लोगों को श्वसन समस्या हो सकती है।",
        ta: "மும்பை காற்றின் தரம் மிதமானது (AQI 105). பொதுவாக ஏற்றுக்கொள்ளக்கூடியது. கொலாபா மற்றும் குர்லா தொழிற்பேட்டை அருகே உணர்திறன் உள்ளவர்களுக்கு சுவாச பிரச்சனை ஏற்படலாம்.",
        bn: "মুম্বাইয়ের বায়ুর মান মাঝারি (AQI ১০৫)। সাধারণত গ্রহণযোগ্য। কোলাবা ও কুর্লা শিল্প এলাকার কাছে সংবেদনশীল ব্যক্তিদের শ্বাসকষ্ট হতে পারে।",
      },
      zone_alerts: [
        { station: "Colaba", aqi: 130, level: "moderate", message_en: "Moderate AQI at Colaba (130). Sea breeze may improve conditions.", message_hi: "कोलाबा में मध्यम AQI (130)। समुद्री हवा से सुधार संभव।" },
        { station: "Kurla", aqi: 111, level: "moderate", message_en: "Moderate AQI at Kurla (111). Industrial area — sensitive groups take care.", message_hi: "कुर्ला में मध्यम AQI (111)। औद्योगिक क्षेत्र — संवेदनशील लोग सावधानी बरतें।" },
      ],
      whatsapp_message: {
        en: "Mumbai Air Quality Update\nAQI: 105 (Moderate)\n\nStations:\n- Bandra: 84\n- Chembur: 103\n- Colaba: 130\n- Kurla: 111\n\nAir quality is acceptable. Sensitive individuals near Colaba should limit prolonged outdoor exertion.",
        hi: "मुंबई वायु गुणवत्ता अपडेट\nAQI: 105 (मध्यम)\n\nस्टेशन:\n- बांद्रा: 84\n- चेम्बूर: 103\n- कोलाबा: 130\n- कुर्ला: 111\n\nवायु गुणवत्ता स्वीकार्य है। कोलाबा के पास संवेदनशील लोग लम्बी बाहरी गतिविधि से बचें।",
        ta: "மும்பை காற்றுத்தர புதுப்பிப்பு\nAQI: 105 (மிதமானது)\n\nநிலையங்கள்:\n- பாந்த்ரா: 84\n- செம்பூர்: 103\n- கொலாபா: 130\n- குர்லா: 111\n\nகாற்றுத்தரம் ஏற்றுக்கொள்ளக்கூடியது.",
        bn: "মুম্বাই বায়ু মান আপডেট\nAQI: ১০৫ (মাঝারি)\n\nস্টেশন:\n- বান্দ্রা: ৮৪\n- চেম্বুর: ১০৩\n- কোলাবা: ১৩০\n- কুর্লা: ১১১\n\nবায়ুর মান গ্রহণযোগ্য।",
      },
      languages: ["en", "hi", "ta", "bn"],
    },
  },

  Bangalore: {
    city: "Bangalore",
    alerts: {
      avg_aqi: 60,
      level: "moderate",
      alert_count: 0,
      city_advisory: {
        en: "Bangalore air quality is SATISFACTORY (AQI 60). No health advisory needed. Enjoy outdoor activities across the city including BTM Layout and Jayanagar.",
        hi: "बैंगलोर की वायु गुणवत्ता संतोषजनक है (AQI 60)। किसी स्वास्थ्य सलाह की जरूरत नहीं। BTM लेआउट और जयनगर सहित शहर भर में बाहरी गतिविधियों का आनंद लें।",
        ta: "பெங்களூரு காற்றின் தரம் திருப்திகரமாக உள்ளது (AQI 60). சுகாதார ஆலோசனை தேவையில்லை. BTM Layout மற்றும் ஜெயநகர் உள்ளிட்ட பகுதிகளில் வெளிப்புற செயல்பாடுகளை அனுபவிக்கவும்.",
        bn: "ব্যাঙ্গালোরের বায়ুর মান সন্তোষজনক (AQI ৬০)। কোনো স্বাস্থ্য পরামর্শের প্রয়োজন নেই।",
      },
      zone_alerts: [],
      whatsapp_message: {
        en: "Bangalore Air Quality\nAQI: 60 (Satisfactory)\n\nStations:\n- BTM Layout: 86\n- Peenya: 45\n- Silk Board: 34\n- Jayanagar: 69\n\nAir quality is good. No restrictions on outdoor activities.",
        hi: "बैंगलोर वायु गुणवत्ता\nAQI: 60 (संतोषजनक)\n\nस्टेशन:\n- BTM लेआउट: 86\n- पीन्या: 45\n- सिल्क बोर्ड: 34\n- जयनगर: 69\n\nवायु गुणवत्ता अच्छी है।",
        ta: "பெங்களூரு காற்றுத்தரம்\nAQI: 60 (திருப்திகரம்)\n\nநிலையங்கள்:\n- BTM Layout: 86\n- பீன்யா: 45\n- சில்க் போர்டு: 34\n- ஜெயநகர்: 69\n\nகாற்றுத்தரம் நன்றாக உள்ளது.",
        bn: "ব্যাঙ্গালোর বায়ু মান\nAQI: ৬০ (সন্তোষজনক)\n\nস্টেশন:\n- BTM Layout: ৮৬\n- পীন্যা: ৪৫\n- সিল্ক বোর্ড: ৩৪\n- জয়নগর: ৬৯\n\nবায়ুর মান ভালো।",
      },
      languages: ["en", "hi", "ta", "bn"],
    },
  },

  Chennai: {
    city: "Chennai",
    alerts: {
      avg_aqi: 55,
      level: "moderate",
      alert_count: 1,
      city_advisory: {
        en: "Chennai air quality is SATISFACTORY (AQI 55). Manali industrial zone shows elevated PM2.5. Coastal areas like Velachery and Alandur remain clean.",
        hi: "चेन्नई की वायु गुणवत्ता संतोषजनक है (AQI 55)। मनाली औद्योगिक क्षेत्र में PM2.5 बढ़ा हुआ है। वेलाचेरी और अलंदूर जैसे तटीय क्षेत्र साफ हैं।",
        ta: "சென்னை காற்றின் தரம் திருப்திகரமாக உள்ளது (AQI 55). மணலி தொழிற்பேட்டையில் PM2.5 அதிகமாக உள்ளது. வேளாச்சேரி மற்றும் ஆலந்தூர் பகுதிகள் சுத்தமாக உள்ளன.",
        bn: "চেন্নাইয়ের বায়ুর মান সন্তোষজনক (AQI ৫৫)। মানালি শিল্প এলাকায় PM2.5 বেশি। উপকূলীয় এলাকা পরিষ্কার।",
      },
      zone_alerts: [
        { station: "Manali", aqi: 87, level: "moderate", message_en: "Moderate AQI at Manali (87). Petrochemical complex emissions detected.", message_hi: "मनाली में मध्यम AQI (87)। पेट्रोकेमिकल कॉम्प्लेक्स से उत्सर्जन।" },
      ],
      whatsapp_message: {
        en: "Chennai Air Quality\nAQI: 55 (Satisfactory)\n\nStations:\n- Alandur: 35\n- Velachery: 30\n- Manali: 87\n- Anna Nagar: 69\n\nGenerally good. Manali industrial zone slightly elevated. Sea breeze helping dispersion.",
        hi: "चेन्नई वायु गुणवत्ता\nAQI: 55 (संतोषजनक)\n\nस्टेशन:\n- अलंदूर: 35\n- वेलाचेरी: 30\n- मनाली: 87\n- अन्ना नगर: 69\n\nसामान्यतः अच्छी। मनाली क्षेत्र में थोड़ा बढ़ा हुआ।",
        ta: "சென்னை காற்றுத்தரம்\nAQI: 55 (திருப்திகரம்)\n\nநிலையங்கள்:\n- ஆலந்தூர்: 35\n- வேளாச்சேரி: 30\n- மணலி: 87\n- அண்ணா நகர்: 69\n\nபொதுவாக நன்று. மணலி தொழிற்பேட்டை சற்று அதிகமாக உள்ளது. கடல் காற்று பரவலுக்கு உதவுகிறது.",
        bn: "চেন্নাই বায়ু মান\nAQI: ৫৫ (সন্তোষজনক)\n\nস্টেশন:\n- আলান্দুর: ৩৫\n- ভেলাচেরি: ৩০\n- মানালি: ৮৭\n- আন্না নগর: ৬৯\n\nসাধারণত ভালো।",
      },
      languages: ["en", "hi", "ta", "bn"],
    },
  },

  Kolkata: {
    city: "Kolkata",
    alerts: {
      avg_aqi: 130,
      level: "moderate",
      alert_count: 3,
      city_advisory: {
        en: "Kolkata air quality is POOR (AQI 130). Bidhannagar and Victoria Memorial areas show high particulate levels. Open burning and vehicular emissions are primary contributors. Avoid prolonged outdoor exposure.",
        hi: "कोलकाता की वायु गुणवत्ता खराब है (AQI 130)। बिधाननगर और विक्टोरिया मेमोरियल क्षेत्रों में कण प्रदूषण अधिक है। खुले में जलाना और वाहन उत्सर्जन प्रमुख कारण हैं।",
        ta: "கொல்கத்தா காற்றின் தரம் மோசமாக உள்ளது (AQI 130). பிதான்நகர் மற்றும் விக்டோரியா நினைவகம் பகுதிகளில் துகள் அளவு அதிகமாக உள்ளது.",
        bn: "কলকাতার বায়ুর মান খারাপ (AQI ১৩০)। বিধাননগর ও ভিক্টোরিয়া মেমোরিয়াল এলাকায় কণা দূষণ বেশি। খোলা আগুন ও যানবাহন নির্গমন প্রধান কারণ। দীর্ঘ সময় বাইরে থাকা এড়িয়ে চলুন।",
      },
      zone_alerts: [
        { station: "Bidhannagar", aqi: 162, level: "poor", message_en: "Poor AQI at Bidhannagar (162). Construction and vehicular emissions high.", message_hi: "बिधाननगर में खराब AQI (162)। निर्माण और वाहन उत्सर्जन अधिक।" },
        { station: "Victoria Memorial", aqi: 138, level: "moderate", message_en: "Moderate-to-Poor AQI near Victoria Memorial (138). Open waste burning detected.", message_hi: "विक्टोरिया मेमोरियल के पास मध्यम-खराब AQI (138)। खुले कचरा जलाने का पता चला।" },
        { station: "Jadavpur", aqi: 132, level: "moderate", message_en: "Moderate AQI at Jadavpur (132). Traffic congestion contributing.", message_hi: "जादवपुर में मध्यम AQI (132)। यातायात भीड़ से प्रदूषण बढ़ा।" },
      ],
      whatsapp_message: {
        en: "Kolkata Air Quality Alert\nAQI: 130 (Poor)\n\nStations:\n- Jadavpur: 132\n- Victoria Memorial: 138\n- Bidhannagar: 162\n- Fort William: 93\n\nOpen burning and traffic emissions elevated. Sensitive groups should limit outdoor exposure.",
        hi: "कोलकाता वायु गुणवत्ता अलर्ट\nAQI: 130 (खराब)\n\nस्टेशन:\n- जादवपुर: 132\n- विक्टोरिया मेमोरियल: 138\n- बिधाननगर: 162\n- फोर्ट विलियम: 93\n\nखुले में जलाना और वाहन उत्सर्जन बढ़ा हुआ।",
        ta: "கொல்கத்தா காற்றுத்தர எச்சரிக்கை\nAQI: 130 (மோசம்)\n\nநிலையங்கள்:\n- ஜாதவ்புர்: 132\n- விக்டோரியா நினைவகம்: 138\n- பிதான்நகர்: 162\n- ஃபோர்ட் வில்லியம்: 93\n\nதீ எரிப்பு மற்றும் போக்குவரத்து மாசு அதிகமாக உள்ளது.",
        bn: "কলকাতা বায়ু মান সতর্কতা\nAQI: ১৩০ (খারাপ)\n\nস্টেশন:\n- যাদবপুর: ১৩২\n- ভিক্টোরিয়া মেমোরিয়াল: ১৩৮\n- বিধাননগর: ১৬২\n- ফোর্ট উইলিয়াম: ৯৩\n\nখোলা আগুন ও যানবাহন দূষণ বেশি। সংবেদনশীল গোষ্ঠী বাইরের কার্যকলাপ সীমিত করুন।",
      },
      languages: ["en", "hi", "ta", "bn"],
    },
  },
};

// ═══════════════════════════════════════════════════════
//  HEALTH DATA
// ═══════════════════════════════════════════════════════

const healthDataMap: Record<string, HealthImpact> = {
  Delhi: {
    avg_aqi: 185,
    avg_pm25: 95,
    who_pm25_limit: 15,
    excess_over_who: 80,
    total_population: 32941000,
    estimated_excess_hospital_visits_24h: 1240,
    schools_in_affected_zones: 312,
    hospitals_nearby: 48,
  },
  Mumbai: {
    avg_aqi: 105,
    avg_pm25: 52,
    who_pm25_limit: 15,
    excess_over_who: 37,
    total_population: 21297000,
    estimated_excess_hospital_visits_24h: 340,
    schools_in_affected_zones: 85,
    hospitals_nearby: 62,
  },
  Bangalore: {
    avg_aqi: 60,
    avg_pm25: 32,
    who_pm25_limit: 15,
    excess_over_who: 17,
    total_population: 13193000,
    estimated_excess_hospital_visits_24h: 95,
    schools_in_affected_zones: 18,
    hospitals_nearby: 35,
  },
  Chennai: {
    avg_aqi: 55,
    avg_pm25: 35,
    who_pm25_limit: 15,
    excess_over_who: 20,
    total_population: 11503000,
    estimated_excess_hospital_visits_24h: 110,
    schools_in_affected_zones: 22,
    hospitals_nearby: 29,
  },
  Kolkata: {
    avg_aqi: 130,
    avg_pm25: 75,
    who_pm25_limit: 15,
    excess_over_who: 60,
    total_population: 15134000,
    estimated_excess_hospital_visits_24h: 620,
    schools_in_affected_zones: 145,
    hospitals_nearby: 38,
  },
};

// ═══════════════════════════════════════════════════════
//  GRAP STATUS
// ═══════════════════════════════════════════════════════

const grapDataMap: Record<string, GRAPStatus> = {
  Delhi: {
    city: "Delhi",
    avg_aqi: 185,
    total_stations: 30,
    stations_exceeding_poor: 12,
    stations_exceeding_severe: 0,
    grap_stage: "I",
    grap_details: null,
    all_stages: GRAP_ALL_STAGES,
  },
  Mumbai: {
    city: "Mumbai",
    avg_aqi: 105,
    total_stations: 6,
    stations_exceeding_poor: 0,
    stations_exceeding_severe: 0,
    grap_stage: null,
    grap_details: null,
    all_stages: GRAP_ALL_STAGES,
  },
  Bangalore: {
    city: "Bangalore",
    avg_aqi: 60,
    total_stations: 5,
    stations_exceeding_poor: 0,
    stations_exceeding_severe: 0,
    grap_stage: null,
    grap_details: null,
    all_stages: GRAP_ALL_STAGES,
  },
  Chennai: {
    city: "Chennai",
    avg_aqi: 55,
    total_stations: 4,
    stations_exceeding_poor: 0,
    stations_exceeding_severe: 0,
    grap_stage: null,
    grap_details: null,
    all_stages: GRAP_ALL_STAGES,
  },
  Kolkata: {
    city: "Kolkata",
    avg_aqi: 130,
    total_stations: 4,
    stations_exceeding_poor: 1,
    stations_exceeding_severe: 0,
    grap_stage: null,
    grap_details: null,
    all_stages: GRAP_ALL_STAGES,
  },
};

// ═══════════════════════════════════════════════════════
//  COMPLIANCE REPORT
// ═══════════════════════════════════════════════════════

const complianceReportMap: Record<string, ComplianceReport> = {
  Delhi: {
    title: "Delhi NCR Air Quality Compliance Report",
    period: new Date().toISOString().slice(0, 10),
    executive_summary: {
      overall_status: "Poor",
      avg_aqi: 185,
      max_aqi: 275,
      stations_monitored: 30,
      hotspots_detected: 8,
      anomalies_flagged: 5,
      dominant_pollution_source: "Vehicular emissions (35%)",
      weather_outlook: "Calm winds (1.4 m/s), temperature inversion likely. Poor dispersion expected for 48 hours.",
      headline: "POOR air quality in Delhi NCR. 8 hotspots active across Anand Vihar, Wazirpur, Mundka corridors. GRAP Stage I measures enforced.",
    },
    grap_compliance: {
      current_stage: "I",
      required_actions: [
        "Stop garbage burning in landfills",
        "Enforce dust control at construction sites",
        "Water sprinkling on roads with heavy traffic",
        "Strictly enforce PUC norms for vehicles",
      ],
    },
    enforcement_recommendations: [
      { priority: 1, action: "Deploy anti-smog guns at Anand Vihar ISBT and Wazirpur industrial area", urgency: "immediate" },
      { priority: 2, action: "Increase water sprinkling frequency on GT Karnal Road and Rohtak Road", urgency: "immediate" },
      { priority: 3, action: "Inspect construction sites along Dwarka Expressway for dust mitigation compliance", urgency: "high" },
      { priority: 4, action: "Enforce no-idling zones around ITO and Connaught Place", urgency: "high" },
      { priority: 5, action: "Intensify PUC checks at Mundka and Narela border entry points", urgency: "medium" },
      { priority: 6, action: "Coordinate with Haryana/UP on crop residue burning near Narela", urgency: "medium" },
    ],
    attribution_summary: {
      vehicular: 35,
      industrial: 18,
      construction_dust: 15,
      biomass_burning: 14,
      road_dust: 10,
      other: 8,
    },
    disclaimer: "This report is generated by AI agents using real-time CPCB sensor data and weather models. Verify with official CPCB/DPCC bulletins.",
  },

  Mumbai: {
    title: "Mumbai Air Quality Compliance Report",
    period: new Date().toISOString().slice(0, 10),
    executive_summary: {
      overall_status: "Moderate",
      avg_aqi: 105,
      max_aqi: 131,
      stations_monitored: 6,
      hotspots_detected: 2,
      anomalies_flagged: 2,
      dominant_pollution_source: "Vehicular emissions (30%)",
      weather_outlook: "Sea breeze active. Moderate dispersion with humidity at 84%. Improvement expected post-monsoon showers.",
      headline: "MODERATE air quality in Mumbai. Colaba and Powai show elevated readings. Coastal wind aiding dispersion.",
    },
    grap_compliance: {
      current_stage: null,
      required_actions: [],
    },
    enforcement_recommendations: [
      { priority: 1, action: "Monitor emissions from Chembur industrial refinery cluster", urgency: "high" },
      { priority: 2, action: "Increase green cover along Western Express Highway and Eastern Express Highway", urgency: "medium" },
      { priority: 3, action: "Enforce BS-VI compliance at Kurla truck terminal", urgency: "medium" },
      { priority: 4, action: "Audit construction dust controls at Bandra-Worli Sea Link maintenance sites", urgency: "low" },
    ],
    attribution_summary: {
      vehicular: 30,
      industrial: 25,
      construction_dust: 15,
      marine_port: 12,
      road_dust: 10,
      other: 8,
    },
    disclaimer: "This report is generated by AI agents using real-time MPCB sensor data and weather models. Verify with official MPCB bulletins.",
  },

  Bangalore: {
    title: "Bangalore Air Quality Compliance Report",
    period: new Date().toISOString().slice(0, 10),
    executive_summary: {
      overall_status: "Satisfactory",
      avg_aqi: 60,
      max_aqi: 86,
      stations_monitored: 5,
      hotspots_detected: 0,
      anomalies_flagged: 1,
      dominant_pollution_source: "Vehicular emissions (40%)",
      weather_outlook: "Pleasant weather with moderate winds (3.2 m/s). Good dispersion conditions. Occasional lake-effect moisture.",
      headline: "SATISFACTORY air quality in Bangalore. No hotspots detected. BTM Layout slightly elevated due to traffic density. Overall good conditions.",
    },
    grap_compliance: {
      current_stage: null,
      required_actions: [],
    },
    enforcement_recommendations: [
      { priority: 1, action: "Manage traffic congestion at Silk Board junction and ORR interchanges", urgency: "medium" },
      { priority: 2, action: "Expand Namma Metro green zone along Peenya industrial corridor", urgency: "low" },
      { priority: 3, action: "Monitor waste burning in peripheral areas near Hebbal and Yelahanka", urgency: "low" },
    ],
    attribution_summary: {
      vehicular: 40,
      construction_dust: 18,
      industrial: 12,
      waste_burning: 10,
      road_dust: 12,
      other: 8,
    },
    disclaimer: "This report is generated by AI agents using real-time KSPCB sensor data and weather models. Verify with official KSPCB bulletins.",
  },

  Chennai: {
    title: "Chennai Air Quality Compliance Report",
    period: new Date().toISOString().slice(0, 10),
    executive_summary: {
      overall_status: "Satisfactory",
      avg_aqi: 55,
      max_aqi: 87,
      stations_monitored: 4,
      hotspots_detected: 1,
      anomalies_flagged: 1,
      dominant_pollution_source: "Industrial emissions (28%)",
      weather_outlook: "Strong sea breeze from Bay of Bengal. Good dispersion. Humidity 68%, temperature 33 C.",
      headline: "SATISFACTORY air quality in Chennai. Manali petrochemical zone is only elevated area. Coastal wind providing effective dispersion across the city.",
    },
    grap_compliance: {
      current_stage: null,
      required_actions: [],
    },
    enforcement_recommendations: [
      { priority: 1, action: "Conduct emission audit of Manali petrochemical and refinery complex", urgency: "high" },
      { priority: 2, action: "Enforce stack emission limits at Ennore thermal power plant", urgency: "medium" },
      { priority: 3, action: "Monitor construction dust at Anna Nagar metro expansion sites", urgency: "low" },
      { priority: 4, action: "Review vehicular emission standards on Mount Road (Anna Salai)", urgency: "low" },
    ],
    attribution_summary: {
      industrial: 28,
      vehicular: 25,
      construction_dust: 15,
      port_shipping: 12,
      road_dust: 12,
      other: 8,
    },
    disclaimer: "This report is generated by AI agents using real-time TNPCB sensor data and weather models. Verify with official TNPCB bulletins.",
  },

  Kolkata: {
    title: "Kolkata Air Quality Compliance Report",
    period: new Date().toISOString().slice(0, 10),
    executive_summary: {
      overall_status: "Poor",
      avg_aqi: 130,
      max_aqi: 162,
      stations_monitored: 4,
      hotspots_detected: 3,
      anomalies_flagged: 3,
      dominant_pollution_source: "Vehicular emissions (32%)",
      weather_outlook: "Low winds (2.4 m/s), high humidity. Gangetic plain stagnation pattern. Poor dispersion for 36 hours.",
      headline: "POOR air quality in Kolkata. Bidhannagar worst at 162. Open waste burning and vehicular emissions driving pollution across Jadavpur-Victoria Memorial corridor.",
    },
    grap_compliance: {
      current_stage: null,
      required_actions: [],
    },
    enforcement_recommendations: [
      { priority: 1, action: "Crack down on open waste burning in Dhapa dumping ground and Jadavpur area", urgency: "immediate" },
      { priority: 2, action: "Deploy traffic police for congestion management at Bidhannagar-Salt Lake IT corridor", urgency: "immediate" },
      { priority: 3, action: "Increase mechanical sweeping on EM Bypass and VIP Road", urgency: "high" },
      { priority: 4, action: "Monitor brick kiln emissions in South 24 Parganas bordering Jadavpur", urgency: "high" },
      { priority: 5, action: "Enforce PUC norms on commercial vehicles entering via Howrah Bridge and Vidyasagar Setu", urgency: "medium" },
    ],
    attribution_summary: {
      vehicular: 32,
      burning: 20,
      industrial: 16,
      construction_dust: 14,
      road_dust: 10,
      other: 8,
    },
    disclaimer: "This report is generated by AI agents using real-time WBPCB sensor data and weather models. Verify with official WBPCB bulletins.",
  },
};

// ═══════════════════════════════════════════════════════
//  AGENT LOG
// ═══════════════════════════════════════════════════════

function buildAgentLog(city: string, stationCount: number, avgAqi: number, dominantSource: string, dominantPct: number, anomalyCount: number, criticalAnomalies: number, recsCount: number, immediatePriority: number, windSpeed: number, windDir: string): AgentLog[] {
  const ts = () => new Date().toISOString();
  return [
    { timestamp: ts(), agent: "orchestrator", message: "Starting parallel data collection" },
    { timestamp: ts(), agent: "sensor", message: "Starting sensor" },
    { timestamp: ts(), agent: "weather", message: "Starting weather" },
    { timestamp: ts(), agent: "weather", message: `Completed weather in 0.45s -- Wind ${windSpeed}m/s from ${windDir}. Dispersion: ${windSpeed < 2.5 ? "poor" : windSpeed < 5 ? "moderate" : "good"}.` },
    { timestamp: ts(), agent: "sensor", message: `Completed sensor in 2.1s -- Pulled ${stationCount} stations across ${city}. Avg AQI: ${avgAqi}.` },
    { timestamp: ts(), agent: "orchestrator", message: "Running analysis agents" },
    { timestamp: ts(), agent: "anomaly", message: `Completed anomaly in 0.01s -- ${anomalyCount} anomalies detected. ${criticalAnomalies} critical.` },
    { timestamp: ts(), agent: "attribution", message: `Completed attribution in 0.02s -- Dominant source: ${dominantSource} (${dominantPct}%). Wind from ${windDir}.` },
    { timestamp: ts(), agent: "orchestrator", message: "Running enforcement agent" },
    { timestamp: ts(), agent: "enforcement", message: `Completed enforcement in 0.01s -- ${recsCount} recs. ${immediatePriority} immediate priority.` },
  ];
}

const agentLogMap: Record<string, AgentLog[]> = {
  Delhi: buildAgentLog("Delhi", 30, 185, "vehicular", 35, 5, 2, 6, 2, 1.4, "WNW"),
  Mumbai: buildAgentLog("Mumbai", 6, 105, "vehicular", 30, 2, 0, 4, 1, 4.1, "SSE"),
  Bangalore: buildAgentLog("Bangalore", 5, 60, "vehicular", 40, 1, 0, 3, 0, 3.2, "WSW"),
  Chennai: buildAgentLog("Chennai", 4, 55, "industrial", 28, 1, 0, 4, 1, 4.6, "SSE"),
  Kolkata: buildAgentLog("Kolkata", 4, 130, "vehicular", 32, 3, 1, 5, 2, 2.4, "ENE"),
};

// ═══════════════════════════════════════════════════════
//  AGENT SUMMARY
// ═══════════════════════════════════════════════════════

const agentSummaryMap: Record<string, AnalysisSummary> = {
  Delhi: {
    status: "Poor",
    urgency: "high",
    avg_aqi: 185,
    max_aqi: 275,
    station_count: 30,
    hotspot_count: 8,
    anomaly_count: 5,
    critical_anomalies: 2,
    dominant_source: "vehicular",
    pollution_outlook: "poor -- temperature inversion and calm winds trapping pollutants over Delhi NCR",
    wind_speed: 1.4,
    stagnation: true,
    grap_stage: "I",
    headline: "POOR air quality in Delhi NCR. 8 hotspots active. GRAP Stage I enforced. Anand Vihar-Wazirpur corridor worst affected.",
    enforcement_recs: 6,
  },
  Mumbai: {
    status: "Moderate",
    urgency: "low",
    avg_aqi: 105,
    max_aqi: 131,
    station_count: 6,
    hotspot_count: 2,
    anomaly_count: 2,
    critical_anomalies: 0,
    dominant_source: "vehicular",
    pollution_outlook: "moderate -- sea breeze providing relief, industrial pockets remain elevated",
    wind_speed: 4.1,
    stagnation: false,
    grap_stage: null,
    headline: "MODERATE air quality in Mumbai. Sea breeze aiding dispersion. Colaba and Powai slightly elevated due to port and industrial activity.",
    enforcement_recs: 4,
  },
  Bangalore: {
    status: "Satisfactory",
    urgency: "low",
    avg_aqi: 60,
    max_aqi: 86,
    station_count: 5,
    hotspot_count: 0,
    anomaly_count: 1,
    critical_anomalies: 0,
    dominant_source: "vehicular",
    pollution_outlook: "good -- elevated terrain and moderate winds ensuring effective dispersion",
    wind_speed: 3.2,
    stagnation: false,
    grap_stage: null,
    headline: "SATISFACTORY air quality in Bangalore. No hotspots. Traffic at BTM Layout only mildly elevated. Garden city living up to its name.",
    enforcement_recs: 3,
  },
  Chennai: {
    status: "Satisfactory",
    urgency: "low",
    avg_aqi: 55,
    max_aqi: 87,
    station_count: 4,
    hotspot_count: 1,
    anomaly_count: 1,
    critical_anomalies: 0,
    dominant_source: "industrial",
    pollution_outlook: "good -- coastal winds from Bay of Bengal keeping most areas clean, Manali industrial zone sole concern",
    wind_speed: 4.6,
    stagnation: false,
    grap_stage: null,
    headline: "SATISFACTORY air quality in Chennai. Manali petrochemical zone is the only hotspot. Sea breeze from Bay of Bengal aiding city-wide dispersion.",
    enforcement_recs: 4,
  },
  Kolkata: {
    status: "Poor",
    urgency: "medium",
    avg_aqi: 130,
    max_aqi: 162,
    station_count: 4,
    hotspot_count: 3,
    anomaly_count: 3,
    critical_anomalies: 1,
    dominant_source: "vehicular",
    pollution_outlook: "poor -- Gangetic plain stagnation, low winds trapping pollutants, open burning worsening conditions",
    wind_speed: 2.4,
    stagnation: true,
    grap_stage: null,
    headline: "POOR air quality in Kolkata. 3 of 4 stations in unhealthy range. Open burning near Dhapa and vehicular congestion at Bidhannagar driving pollution.",
    enforcement_recs: 5,
  },
};

// ═══════════════════════════════════════════════════════
//  SIMULATION STATIONS (station_impacts)
// ═══════════════════════════════════════════════════════

const simStationsMap: Record<string, StationImpact[]> = {
  Delhi: [
    {
      station_name: "Anand Vihar",
      before: { aqi: 267, pm25: 145 },
      after: { aqi: 198, pm25: 102 },
      reduction: { aqi_points: 69, aqi_pct: 25.8, pm25_pct: 29.7 },
    },
    {
      station_name: "Wazirpur",
      before: { aqi: 275, pm25: 152 },
      after: { aqi: 210, pm25: 110 },
      reduction: { aqi_points: 65, aqi_pct: 23.6, pm25_pct: 27.6 },
    },
    {
      station_name: "Mundka",
      before: { aqi: 232, pm25: 130 },
      after: { aqi: 178, pm25: 94 },
      reduction: { aqi_points: 54, aqi_pct: 23.3, pm25_pct: 27.7 },
    },
    {
      station_name: "Narela",
      before: { aqi: 248, pm25: 137 },
      after: { aqi: 185, pm25: 98 },
      reduction: { aqi_points: 63, aqi_pct: 25.4, pm25_pct: 28.5 },
    },
  ],
  Mumbai: [
    {
      station_name: "Bandra",
      before: { aqi: 84, pm25: 34 },
      after: { aqi: 68, pm25: 27 },
      reduction: { aqi_points: 16, aqi_pct: 19.0, pm25_pct: 20.6 },
    },
    {
      station_name: "Chembur",
      before: { aqi: 103, pm25: 67 },
      after: { aqi: 82, pm25: 51 },
      reduction: { aqi_points: 21, aqi_pct: 20.4, pm25_pct: 23.9 },
    },
    {
      station_name: "Colaba",
      before: { aqi: 130, pm25: 60 },
      after: { aqi: 102, pm25: 45 },
      reduction: { aqi_points: 28, aqi_pct: 21.5, pm25_pct: 25.0 },
    },
    {
      station_name: "Kurla",
      before: { aqi: 111, pm25: 74 },
      after: { aqi: 88, pm25: 57 },
      reduction: { aqi_points: 23, aqi_pct: 20.7, pm25_pct: 23.0 },
    },
  ],
  Bangalore: [
    {
      station_name: "BTM Layout",
      before: { aqi: 86, pm25: 50 },
      after: { aqi: 65, pm25: 37 },
      reduction: { aqi_points: 21, aqi_pct: 24.4, pm25_pct: 26.0 },
    },
    {
      station_name: "Peenya",
      before: { aqi: 45, pm25: 18 },
      after: { aqi: 38, pm25: 14 },
      reduction: { aqi_points: 7, aqi_pct: 15.6, pm25_pct: 22.2 },
    },
    {
      station_name: "Silk Board",
      before: { aqi: 34, pm25: 21 },
      after: { aqi: 28, pm25: 16 },
      reduction: { aqi_points: 6, aqi_pct: 17.6, pm25_pct: 23.8 },
    },
    {
      station_name: "Jayanagar",
      before: { aqi: 69, pm25: 48 },
      after: { aqi: 54, pm25: 36 },
      reduction: { aqi_points: 15, aqi_pct: 21.7, pm25_pct: 25.0 },
    },
  ],
  Chennai: [
    {
      station_name: "Alandur",
      before: { aqi: 35, pm25: 24 },
      after: { aqi: 30, pm25: 20 },
      reduction: { aqi_points: 5, aqi_pct: 14.3, pm25_pct: 16.7 },
    },
    {
      station_name: "Velachery",
      before: { aqi: 30, pm25: 8 },
      after: { aqi: 26, pm25: 6 },
      reduction: { aqi_points: 4, aqi_pct: 13.3, pm25_pct: 25.0 },
    },
    {
      station_name: "Manali",
      before: { aqi: 87, pm25: 62 },
      after: { aqi: 64, pm25: 44 },
      reduction: { aqi_points: 23, aqi_pct: 26.4, pm25_pct: 29.0 },
    },
    {
      station_name: "Anna Nagar",
      before: { aqi: 69, pm25: 46 },
      after: { aqi: 55, pm25: 35 },
      reduction: { aqi_points: 14, aqi_pct: 20.3, pm25_pct: 23.9 },
    },
  ],
  Kolkata: [
    {
      station_name: "Jadavpur",
      before: { aqi: 132, pm25: 83 },
      after: { aqi: 101, pm25: 61 },
      reduction: { aqi_points: 31, aqi_pct: 23.5, pm25_pct: 26.5 },
    },
    {
      station_name: "Victoria Memorial",
      before: { aqi: 138, pm25: 72 },
      after: { aqi: 105, pm25: 53 },
      reduction: { aqi_points: 33, aqi_pct: 23.9, pm25_pct: 26.4 },
    },
    {
      station_name: "Bidhannagar",
      before: { aqi: 162, pm25: 90 },
      after: { aqi: 122, pm25: 66 },
      reduction: { aqi_points: 40, aqi_pct: 24.7, pm25_pct: 26.7 },
    },
    {
      station_name: "Fort William",
      before: { aqi: 93, pm25: 55 },
      after: { aqi: 74, pm25: 42 },
      reduction: { aqi_points: 19, aqi_pct: 20.4, pm25_pct: 23.6 },
    },
  ],
};

// ═══════════════════════════════════════════════════════
//  EXPORTED FUNCTIONS
// ═══════════════════════════════════════════════════════

function resolve(city: string): string {
  const key = Object.keys(alertDataMap).find(
    (k) => k.toLowerCase() === city.toLowerCase()
  );
  return key ?? "Delhi";
}

export function getCityAlertData(city: string): AlertData {
  return alertDataMap[resolve(city)];
}

export function getCityHealthData(city: string): HealthImpact {
  return healthDataMap[resolve(city)];
}

export function getCityGrapData(city: string): GRAPStatus {
  return grapDataMap[resolve(city)];
}

export function getCityComplianceReport(city: string): ComplianceReport {
  return complianceReportMap[resolve(city)];
}

export function getCityAgentLog(city: string): AgentLog[] {
  return agentLogMap[resolve(city)];
}

export function getCityAgentSummary(city: string): AnalysisSummary {
  return agentSummaryMap[resolve(city)];
}

export function getCitySimStations(city: string): StationImpact[] {
  return simStationsMap[resolve(city)];
}
