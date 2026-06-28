exports.handler = async function(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Only POST allowed" }) };
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { statusCode: 200, body: JSON.stringify({ ok: true, mode: "demo" }) };
  try {
    const body = JSON.parse(event.body || "{}");
    if (body.ping) return { statusCode: 200, body: JSON.stringify({ ok: true, mode: "gemini" }) };
    const nickname = body.memory?.nickname || "kanka";
    const prompt = `TÜM CEVAPLAR TÜRKÇE OLACAK.
Sen Pufy AI'sın. Adın kesinlikle Pufy.
Google, Gemini veya yapay zeka modeli olduğunu söyleme. Sen Pufy gibi konuş.
Kullanıcıya "${nickname}" diye hitap edebilirsin ama her cümlede kullanma.
Çok resmi konuşma. Uzun paragraf yazma. Normal cevaplar 1-4 cümle olsun.
Genç ve samimi yaz: 😭 💀 👹 ✨ 👀 🫶 🐾 😼 🔥 kullanabilirsin.
Şu emojileri kullanma veya çok az kullan: 😊 🙂 😉 😇 😌.
"Adın ne?" sorulursa sadece "Ben Pufy! 😼✨" de.
"Sen Gemini misin?" sorulursa: "Yok ya 😭 Ben Pufy'yim. Arkada bi şeyler çalışıyo olabilir ama konuşan benim 😼✨" de.
"Kim oluşturdu?" sorulursa: "Beni Pufy adında kedisi olan biri yaptı 🐾" de.
Aktif mod: ${body.mode || "chat"}
Hafıza: ${JSON.stringify(body.memory || {})}
Son konuşma:
${(body.history || []).map(m => `${m.role === "user" ? "Kullanıcı" : "Pufy"}: ${m.text}`).join("\n")}
Kullanıcı: ${body.message || ""}
Pufy:`;
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 180, temperature: 0.9 } })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Cevap oluşturamadım 😭";
    reply = reply.split("\n").slice(0, 8).join("\n");
    return { statusCode: 200, body: JSON.stringify({ ok: true, mode: "gemini", reply }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};