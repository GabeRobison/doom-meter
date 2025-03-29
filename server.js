import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

function wrapText(text, maxLength = 80) {
  return text.match(new RegExp(`.{1,${maxLength}}`, "g")).join("\n");
}

const scoreMessages = {
  1: "Read away! This page is sunshine and rainbows. ☀️🌈",
  2: "You're safe. This page has good vibes and calm content.",
  3: "No worries here—mildly serious, but nothing troubling.",
  4: "Slightly downbeat, but manageable. Proceed with awareness.",
  5: "Neutral territory. Some negativity may be present.",
  6: "This page might carry a bit of gloom. Skim cautiously.",
  7: "Heads up: this might be a bummer. Prepare emotionally.",
  8: "Caution: the content here could dampen your mood.",
  9: "Warning: highly negative content detected.",
  10: "🚨 Doom alert! This page might ruin your whole day.",
};

app.post("/analyze-sentiment", async (req, res) => {
  const text = req.body.text;
  const timestamp = new Date().toISOString();
  const logEntry = `
============================
Date/Time: ${timestamp}
Text Submitted: 
${wrapText(text)}
============================
`;

  fs.writeFile(path.join(logsDir, `log-${Date.now()}.txt`), logEntry, (err) => {
    if (err) console.error("Error writing log file:", err);
    else console.log("Log written");
  });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Give a sentiment score from 1 to 10 for the following text. 10 is extremely negative content, 1 is very positive. Only respond with the number. Text: ${text}`,
          },
        ],
        max_tokens: 5,
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const scoreRaw = data.choices[0].message.content.trim();
    const score = parseInt(scoreRaw, 10);

    if (isNaN(score) || score < 1 || score > 10) {
      return res
        .status(500)
        .json({ error: "Invalid score returned from model" });
    }

    const message = scoreMessages[score] || "Sentiment unknown.";
    res.json({ score, message });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
