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
  res.send(`<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="UTF-8">
<title>OpenRouter Chat</title>
<style>
body { font-family: Arial; margin: 20px; max-width: 600px; }
textarea { width: 100%; padding: 10px; font-size: 16px; }
button { margin-top: 10px; padding: 10px 20px; font-size: 16px; }
pre { background: #f0f0f0; padding: 10px; white-space: pre-wrap; }
</style>
</head>
<body>

<h2>Chat مع OpenRouter</h2>
<textarea id="input" rows="4" placeholder="اكتب رسالتك هنا"></textarea><br>
<button onclick="sendMessage()">إرسال</button>
<pre id="output"></pre>

<script>
async function sendMessage() {
    const inputText = document.getElementById("input").value;
    if (!inputText.trim()) return;

    const messages = [{ role: "user", content: inputText }];
    document.getElementById("output").textContent = "جاري الإرسال...";

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });

        const data = await res.json();
        if (data.error) {
            document.getElementById("output").textContent = "خطأ: " + JSON.stringify(data, null, 2);
        } else {
            document.getElementById("output").textContent = data.reply || JSON.stringify(data, null, 2);
        }
    } catch (err) {
        document.getElementById("output").textContent = "حدث خطأ في الاتصال: " + err;
    }
}
</script>

</body>
</html>`);
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
