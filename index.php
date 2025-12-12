<?php
// ضع مفتاح OpenRouter هنا
$OPENROUTER_API_KEY = "<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>";
$MODEL = "openai/gpt-4o";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['messages']) || !is_array($input['messages'])) {
        echo json_encode(['error' => 'messages must be an array']);
        exit;
    }

    $payload = [
        'model' => $MODEL,
        'messages' => $input['messages'],
        'temperature' => 0.2,
        'max_tokens' => 800
    ];

    $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "Authorization: Bearer $OPENROUTER_API_KEY"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

    $response = curl_exec($ch);
    if ($response === false) {
        echo json_encode(['error' => 'CURL failed', 'details' => curl_error($ch)]);
        exit;
    }

    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code !== 200) {
        echo json_encode(['error' => 'OpenRouter API returned HTTP ' . $http_code, 'response' => $response]);
        exit;
    }

    echo $response;
    exit;
}
?>

<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="UTF-8">
<title>OpenRouter Chat</title>
<style>
body { font-family: Arial; margin: 20px; }
textarea { width: 100%; }
button { margin-top: 10px; padding: 10px 20px; }
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
    const messages = [{ role: "user", content: document.getElementById("input").value }];
    document.getElementById("output").textContent = "جاري الإرسال...";
    
    try {
        const res = await fetch('', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });
        
        const data = await res.json();
        if(data.error) {
            document.getElementById("output").textContent = "خطأ: " + JSON.stringify(data, null, 2);
        } else {
            const reply = data?.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);
            document.getElementById("output").textContent = reply;
        }
    } catch (err) {
        document.getElementById("output").textContent = "حدث خطأ في الاتصال: " + err;
    }
}
</script>
</body>
</html>
