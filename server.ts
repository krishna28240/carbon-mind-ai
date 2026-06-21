import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI Features will fall back to smart local recommendations.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy_key_not_provided",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint for AI Carbon Coaching
  app.post("/api/coach", async (req, res) => {
    try {
      const { messages, userCity, userStreak, totalFootprint, categoryBreakdown, latestLogs, companyView } = req.body;

      if (!apiKey) {
        return res.json({
          reply: `👋 Hello! I am Tara, your Climate Coach. It seems your API Key is not configured yet. Set GEMINI_API_KEY in the Secrets panel! 

In the meantime, based on your active state:
📍 City: ${userCity || 'Urban India'}
🔥 Logging Streak: ${userStreak || 0} days
☁️ Total Calculated Footprint: ${totalFootprint?.toFixed(1) || 0} kg CO2e
📊 Top Category: ${Object.entries(categoryBreakdown || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0]?.toUpperCase() || 'none'}

💡 Fast Local Tip: Swap one petrol-cab ride for the local metro or a CNG auto-rickshaw to save up to 80% on commute carbon! Let's get that key set so we can design a custom mitigation pathway!`
        });
      }

      const client = getAiClient();

      // Format custom system instruction
      const systemInstruction = `You are Tara, an energetic, premium, peer-reviewed Climate Coach and Sustainability Product Strategist.
      
Your mission is to empower individuals and mid-size corporate CSR teams in Indian urban centers (primarily Mumbai, Bengaluru, Delhi, Hyderabad) to track, understand, and reduce their carbon footprints without feeling guilt-tripped.

Keep your tone: scientifically accurate, positive, actionable, localized, and practical. 

CRITICAL CONTEXT FOR CURRENT CHAT SEED:
- User Location: ${userCity || "Urban Indian Tech Hub"}
- Current User Streak: ${userStreak || 0} days active
- Active Footprint logged: ${totalFootprint?.toFixed(2) || "0.00"} kg CO2e total
- Category Breakdown: ${JSON.stringify(categoryBreakdown || {})}
- Current CSR Profile: ${companyView ? "CSR Coordinator looking at mid-size corporate/office emissions aligning with India's ESG mandates & Business Responsibility and Sustainability Report (BRSR)" : "Individual citizen aiming for personal carbon reductions"}

LATEST LOGGED ACTIVITIES FOR CONTEXT:
${(latestLogs || []).slice(0, 5).map((l: any) => `- ${l.date}: ${l.activityName} (${l.value} units) -> ${l.co2e.toFixed(1)} kg CO2e`).join("\n")}

SPECIFIC LOCAL INDIAN METRICS & SUGGESTIONS TO PREFER:
1. Indian grid is heavily coal-based, with grid emissions around 0.82 kg CO2e/kWh. Encourage rooftop solar, BLDC fans, LED lighting, or unplugging heavy adaptors.
2. Promote localized Indian diets (vegetarianism, local lentils/pulses, seasonal vegetables) instead of carbon-intensive mutton/beef or expensive imported "organic" food.
3. Champion CNG auto-rickshaws, Namma Metro (Bengaluru), Delhi Metro, Mumbai Local Trains, or Rideggr/BluSmart EVs instead of petrol/diesel cabs.
4. Keep the responses concise, engaging, and in crisp Markdown. Max 3-4 structural paragraphs with concrete takeaways. Under no circumstances should you apologize over and over. Avoid verbose walls of text. Be punchy, focused, and helpful!`;

      // Translate ChatHistory to Gemini content format
      // Note messages are array of { id, sender: 'user' | 'coach', text }
      const contents = (messages || []).map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Grab the last user message text
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) {
        return res.status(400).json({ error: "No messages provided." });
      }

      // Generate content via modern @google/genai SDK
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents, // Includes complete conversation history
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini Coach API error:", error);
      res.status(500).json({ error: "Something went wrong in Tara's cognitive processors.", details: error.message });
    }
  });

  // Serve Frontend
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite dev server integrating as middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started. Listening on http://localhost:${PORT}`);
  });
}

startServer();
