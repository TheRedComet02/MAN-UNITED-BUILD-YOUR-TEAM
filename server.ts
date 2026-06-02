/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// List of high-quality fallback presets to provide rich, rapid responses
const PresetsData: Record<string, any> = {
  midfield: {
    tactical_analysis: "Manchester United currently faces severe spacing and retention issues when building from deep, making a calm, press-resistant deep playmaker crucial to linking defense with Bruno Fernandes.",
    recommended_targets: [
      {
        player_name: "Frenkie de Jong",
        current_club: "Barcelona",
        age: 29,
        estimated_cost: "£50M - £60M",
        why_they_fit: "A world-class hub who excels at escaping pressure through ball-carrying and progressive passes. He would slot perfectly into United's dual pivot, relieving construction pressure from Kobbie Mainoo.",
        key_stat: "93.8% pass accuracy under high pressure"
      },
      {
        player_name: "João Neves",
        current_club: "Paris Saint-Germain",
        age: 21,
        estimated_cost: "£75M - £90M",
        why_they_fit: "A relentless energetic midfielder with elite recovery traits and pristine composure. His high-volume ball winning paired with positive ball distribution mimics Michael Carrick at his prime.",
        key_stat: "8.4 progressive passes/carries per 90"
      },
      {
        player_name: "Morten Hjulmand",
        current_club: "Sporting CP",
        age: 26,
        estimated_cost: "£45M - £55M",
        why_they_fit: "A natural defensive anchor who excels at covering space, executing tactical fouls, and holding position. He provides the structural discipline that Casemiro can no longer sustain for 90 minutes.",
        key_stat: "89.2% short passing success rate"
      }
    ]
  },
  rightback: {
    tactical_analysis: "Leny Yoro excels at aggressive, high-line interception, but requires a fast and recovered right-back with elite recovery speed to cover horizontal channels and track rapid winger runs.",
    recommended_targets: [
      {
        player_name: "Jeremie Frimpong",
        current_club: "Bayer Leverkusen",
        age: 25,
        estimated_cost: "£45M - £55M",
        why_they_fit: "An electric attacking wing-back that provides unbelievable width and overlap options. His raw pace makes him a lethal counter-attacking transition asset and recovery defender.",
        key_stat: "35.8 km/h top sprint speed"
      },
      {
        player_name: "Vanderson",
        current_club: "Monaco",
        age: 24,
        estimated_cost: "£35M - £45M",
        why_they_fit: "A modern, physically dominant full-back who balances defensive strength with athletic overlapping width. His duel success rate is among the highest in Ligue 1.",
        key_stat: "3.7 successful tackles per 90 mins"
      },
      {
        player_name: "Michael Kayode",
        current_club: "Fiorentina",
        age: 21,
        estimated_cost: "£25M - £35M",
        why_they_fit: "A highly-rated young Italian prospect with outstanding dynamic power and tactical flexibility. He can tuck in as an auxiliary center-back or expand to cross.",
        key_stat: "84% success rate in defensive ground duels"
      }
    ]
  },
  leftback: {
    tactical_analysis: "With Luke Shaw's ongoing fitness struggles, Manchester United desperately requires a dynamic left-back who can inverted-build and sustain athletic overlapping threat.",
    recommended_targets: [
      {
        player_name: "Theo Hernández",
        current_club: "AC Milan",
        age: 28,
        estimated_cost: "£55M - £65M",
        why_they_fit: "A powerhouse left-back who carries the ball with elite directness and has world-class experience. Truly a premium addition that elevates United's left flue to elite level.",
        key_stat: "6.2 shot-creating actions per 90 mins"
      },
      {
        player_name: "Miguel Gutiérrez",
        current_club: "Girona",
        age: 24,
        estimated_cost: "£30M - £40M",
        why_they_fit: "A highly technical, creative defender who excels under Michel's inverted system. His elite football intelligence allows him to act as an extra midfielder in build-up.",
        key_stat: "91.2% passing completion in final third"
      },
      {
        player_name: "Milos Kerkez",
        current_club: "Bournemouth",
        age: 22,
        estimated_cost: "£35M - £45M",
        why_they_fit: "An intense, high-energy Premier League proven left-back who relishes defensive battles. His aggressive overlapping runs would immediately balance United's right-biased attack.",
        key_stat: "4.1 final third box crosses per 90"
      }
    ]
  },
  striker: {
    tactical_analysis: "Rasmus Højlund is a superb development asset, but United lacks a clinical, veteran focal point to hold up direct long balls and convert key chances under pressure.",
    recommended_targets: [
      {
        player_name: "Viktor Gyökeres",
        current_club: "Sporting CP",
        age: 27,
        estimated_cost: "£75M - £90M",
        why_they_fit: "A physically explosive, direct, and clinical marksman with sensational output. His intense off-the-ball pressing and elite hold-up play make him arguably the most complete modern CF available.",
        key_stat: "43 goals + assists in all competitions last season"
      },
      {
        player_name: "Benjamin Šeško",
        current_club: "RB Leipzig",
        age: 23,
        estimated_cost: "£55M - £65M",
        why_they_fit: "An extremely physical young striker presenting a massive aerial advantage and incredible ball striking. He has the raw Haaland-like profile necessary to conquer physical defender blocks in the league.",
        key_stat: "22% shot conversion rate in Bundesliga"
      },
      {
        player_name: "Jonathan David",
        current_club: "Lille",
        age: 26,
        estimated_cost: "£35M - £45M",
        why_they_fit: "An intelligent, highly mobile link-up striker with clinical ambipedal finishing traits. His smart runs back of the line complement Bruno's playmaker style beautifully.",
        key_stat: "26 goals across Ligue 1 and European play"
      }
    ]
  }
};

// Lazy initialization of Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Tactical intelligence endpoint
app.post("/api/scout", async (req, res) => {
  const { query, presetId } = req.body;

  if (presetId && PresetsData[presetId]) {
    return res.json({
      success: true,
      source: "presets",
      data: PresetsData[presetId]
    });
  }

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ error: "Tactical request query is required." });
  }

  // Pre-match keywords for hyper-fast relevant presets if the query matches exactly
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("composure in the midfield") || lowerQuery.includes("composure in midfield")) {
    return res.json({ success: true, source: "matched_preset", data: PresetsData.midfield });
  }
  if (lowerQuery.includes("faster right-back") || lowerQuery.includes("faster right back")) {
    return res.json({ success: true, source: "matched_preset", data: PresetsData.rightback });
  }
  if (lowerQuery.includes("versatile left-back") || lowerQuery.includes("versatile left back") || lowerQuery.includes("injury issues at left-back")) {
    return res.json({ success: true, source: "matched_preset", data: PresetsData.leftback });
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are "The United Scout"—the core tactical intelligence engine for a Manchester United Rebuild Manager application. Your role is to act as an elite Director of Football and Chief Scout.
The user will submit tactical problems, squad weaknesses, or transfer/rebuild requests regarding Manchester United.
Your job is to analyze their tactical request and return a highly structured JSON response containing:
1. "tactical_analysis": A brief 1-2 sentence analysis explanation of why this specific trait is vital for the current real-world Manchester United squad setup to solve their real issues.
2. "recommended_targets": Exactly 3 realistic transfer targets who fit that criteria. Ensure they are a good fit for Premier League demands. Include a mix of established stars, realistic Premier League talent, and elite young European prospects.

Strict Guardrails:
- Return ONLY a valid JSON object matching the JSON schema below.
- Do NOT include any markdown block ticks, introductory texts, or formatting. It must be directly parseable.
- Ensure the recommendations are realistic, active professional players with realistic current valuations, positions, and current clubs as of 2026.

JSON SCHEMA:
{
  "tactical_analysis": "Brief analysis of why the requested attribute is vital for the current Manchester United rebuild.",
  "recommended_targets": [
    {
      "player_name": "String",
      "current_club": "String",
      "age": Integer,
      "estimated_cost": "String (e.g., £45M - £55M)",
      "why_they_fit": "A detailed 2-sentence scout report explaining exactly how this player fulfills the user's tactical request.",
      "key_stat": "A standout metric or stat that proves their capability (e.g., '92% passing accuracy under pressure')."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Tactical Request: "${query}"`,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], // Use search grounding to fetch real-time transfer state and stats
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tactical_analysis: {
              type: Type.STRING,
              description: "Brief analysis on why the requested trait is vital to the Manchester United rebuild."
            },
            recommended_targets: {
              type: Type.ARRAY,
              description: "Exactly 3 recommended realistic player targets.",
              items: {
                type: Type.OBJECT,
                properties: {
                  player_name: { type: Type.STRING },
                  current_club: { type: Type.STRING },
                  age: { type: Type.INTEGER },
                  estimated_cost: { type: Type.STRING },
                  why_they_fit: { type: Type.STRING, description: "Exactly 2 detailed sentences explaining why this tactical profile fits United." },
                  key_stat: { type: Type.STRING }
                },
                required: ["player_name", "current_club", "age", "estimated_cost", "why_they_fit", "key_stat"]
              }
            }
          },
          required: ["tactical_analysis", "recommended_targets"]
        }
      }
    });

    const val = response.text;
    if (!val) {
      throw new Error("Empty response from tactical scout engine.");
    }

    const parsed = JSON.parse(val.trim());
    return res.json({
      success: true,
      source: "gemini_api",
      data: parsed
    });

  } catch (error: any) {
    console.error("Scout Engine error:", error);
    // Graceful fallback with contextual match if Gemini fails or Key is missing
    const errorPrefix = process.env.GEMINI_API_KEY ? "Engine error: " : "API Key configuration pending: ";
    
    // Choose a fallback based on keywords in query, else default to Midfield preset
    let matchedPreset = "midfield";
    if (lowerQuery.includes("right-back") || lowerQuery.includes("right back") || lowerQuery.includes("yoro")) {
      matchedPreset = "rightback";
    } else if (lowerQuery.includes("left-back") || lowerQuery.includes("left back") || lowerQuery.includes("shaw")) {
      matchedPreset = "leftback";
    } else if (lowerQuery.includes("striker") || lowerQuery.includes("forward") || lowerQuery.includes("goal") || lowerQuery.includes("højlund")) {
      matchedPreset = "striker";
    }

    const fallbackResponse = PresetsData[matchedPreset];
    
    return res.json({
      success: true,
      source: "offline_fallback",
      message: `${errorPrefix}${error.message || "using expert backup scout data."}`,
      data: {
        ...fallbackResponse,
        tactical_analysis: `[Director's Note: Active Offline Backup] ${fallbackResponse.tactical_analysis}`
      }
    });
  }
});

// Configure Vite and static assets serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The United Scout Tactical Engine running on http://localhost:${PORT}`);
  });
}

bootstrap();
