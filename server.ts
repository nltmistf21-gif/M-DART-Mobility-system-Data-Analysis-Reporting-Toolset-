import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Gemini AI setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.post("/api/generate-report-text", async (req, res) => {
  try {
    const { peakValues, sensorMetadata, feaComparison } = req.body;

    const prompt = `
      You are an aerospace structural engineer. Write a professional technical summary for a mobility system test report.
      Context: Mobility system structural stability test.
      
      Test Data:
      ${peakValues.map((p: any) => `- Sensor ${p.sensorId}: Max Peak ${p.value} ${p.unit} detected at ${p.timestamp}`).join('\n')}
      
      FEA Correlation:
      ${feaComparison.map((f: any) => `- Sensor ${f.sensorId}: Test ${f.testValue} vs FEA ${f.feaValue} (Error: ${f.errorRate}%, Status: ${f.status})`).join('\n')}
      
      Requirements:
      1. Analyze if the measured stresses are within structural safety limits (Yield strength is generally 450MPa unless noted).
      2. Mention any significant deviations between FEA results and actual tests.
      3. Use professional tone. Output in Korean as the user is a Korean aerospace team, but keep technical terms standard.
      4. Format as a concise summary paragraph followed by 3 key bullet points.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
