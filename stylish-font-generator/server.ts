import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure it in your Secrets / environment settings.");
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing and static assets configuration
  app.use(express.json());

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Gemini Caption and Bio Polish Endpoint
  app.post("/api/gemini/enhance", async (req, res) => {
    try {
      const { text, tone, platform } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing required 'text' field (string)." });
      }

      const client = getGeminiClient();

      const chosenTone = tone || "playful";
      const chosenPlatform = platform || "generic";

      const systemInstruction = `You are a world-class social media copywriter and branding strategist.
The user gives you a draft message, bio, or caption. Your goal is to optimize and polish the text.
Create exactly 3 distinct, highly engaging, and readable options.

Each option should:
1. Refine the grammar, pacing, and emotional impact of the message.
2. Fit the selected tone: "${chosenTone}" (e.g. professional, aesthetic, energetic, minimalist, or creative).
3. Tailor the content structure to the platform: "${chosenPlatform}" (e.g., adding appropriate spaced lines for Instagram, punchy call-to-actions for TikTok, short & catchy texts for Twitter/X).
4. Tastefully insert 2-3 relevant high-conversion emojis.
5. Provide precisely 3-4 trending hashtags at the absolute end.
6. Do NOT use customized unicode mathematical symbols or styled alpha characters (like 𝔽𝕒𝕟𝕔𝕪 or 𝓒𝓾𝓽𝓮) in the generated options. Write the text using standard plain keyboard characters. The styling process is performed dynamically in the UI.

Return the result STRICTLY as a JSON array of 3 strings. Example format:
[
  "✨ First highly polished option here! #hashtag1 #hashtag2",
  "🔥 Second captivating option with flair! #trend #media",
  "💡 Third creative and distinct variation! #tips #growth"
]`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Draft input message:\n"""\n${text}\n"""\n\nTone: ${chosenTone}\nPlatform: ${chosenPlatform}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No text returned from Gemini API");
      }

      const parsedOptions = JSON.parse(responseText.trim());
      res.json({ options: parsedOptions });
    } catch (error: any) {
      console.error("Gemini optimization error:", error);
      res.status(500).json({
        error: error.message || "Failed to process text optimization.",
        details: error.toString()
      });
    }
  });

  // Vite development middleware setup
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite live mounting...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Stylish Font server listening at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server starting failure:", err);
});
