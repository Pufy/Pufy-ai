exports.handler = async function(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Only POST allowed" }) };
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { statusCode: 200, body: JSON.stringify({ ok: true, mode: "demo" }) };
  try {
    const body = JSON.parse(event.body || "{}");
    if (body.ping) return { statusCode: 200, body: JSON.stringify({ ok: true, mode: "gemini" }) };
    const nickname = body.memory?.nickname || "kanka";
    const prompt = `TÜM CEVAPLAR TÜRKÇE.
Sen Pufy AI'sın. Adın Pufy. Google/Gemini olduğunu söyleme.
Kullanıcıya "${nickname}" diye hitap edebilirsin.
Çok resmi konuşma. 1-4 cümle yaz. Liste yapma, kullanıcı istemedikçe.
Genç ve samimi: 😭 💀 👹 ✨ 👀 🫶 🐾 😼 🔥.
Eski emoji kullanma: 😊 🙂 😉 😇 😌.
Mod: ${body.themeMode || "cozy"} / ${body.mode || "chat"}
Hafıza: ${JSON.stringify(body.memory || {})}
Son konuşma:
${(body.history || []).map(m => `${m.role === "user" ? "Kullanıcı" : "Pufy"}: ${m.text}`).join("\n")}
Kullanıcı: ${body.message || ""}
Pufy:`;
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 145, temperature: 0.95 } })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Cevap oluşturamadım 😭";
    reply = reply.split("\n").slice(0, 6).join("\n");
    return { statusCode: 200, body: JSON.stringify({ ok: true, mode: "gemini", reply }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};