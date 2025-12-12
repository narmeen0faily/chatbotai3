const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // إذا كنت تستخدم Node.js >=18 يمكن استخدام fetch بدون استيراد

const app = express();
app.use(cors());
app.use(express.json());

// المفتاح من متغير البيئة
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-4o";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("Server is running. Use POST /api/chat");
});

// API الأساسي
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const payload = { model: MODEL, messages, temperature: 0.2, max_tokens: 800 };
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: "OpenRouter API error", details: text });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content ?? data;
    res.json({ ok: true, reply, raw: data });
  } catch (err) {
    res.status(500).json({ error: "server error", details: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
