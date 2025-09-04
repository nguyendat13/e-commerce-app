// const express = require("express");
// const router = express.Router();
// const fetch = require("node-fetch");

// // 🔑 Key của bạn
// const GEMINI_KEY = "AIzaSyANOX0CXjJtz6VxluYjv5msGZw8ii4LXCs";  

// router.post("/chat", async (req, res) => {
//   const { messages, model = "gemini-2.0-flash" } = req.body || {};

//   try {
//     const r = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-goog-api-key": GEMINI_KEY,
//         },
//         body: JSON.stringify({
//           contents: messages.map((m) => ({
//             role: m.role === "user" ? "user" : "model",
//             parts: [{ text: m.content }],
//           })),
//         }),
//       }
//     );

//     const data = await r.json();
//     const reply =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text ||
//       "Xin lỗi, chưa có phản hồi từ AI.";

//     return res.json({ reply });
//   } catch (e) {
//     console.error("Gemini proxy error:", e);
//     return res.status(500).json({ error: "Gemini proxy error" });
//   }
// });

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const axios = require("axios");

// 🔑 Gemini API Key
const GEMINI_KEY = "AIzaSyANOX0CXjJtz6VxluYjv5msGZw8ii4LXCs";

// 🔗 Backend Spring Boot
const API_URL = "http://10.196.85.41:8080/api";

// ✅ Route chat AI (Spring Boot + Gemini)
router.post("/chat", async (req, res) => {
  const { messages, model = "gemini-2.0-flash" } = req.body || {};
  const userMsg = messages?.[messages.length - 1]?.content?.toLowerCase() || "";
  const jwtToken = req.headers["authorization"]; // Bearer <token>

  try {
    // Nếu user hỏi sản phẩm → gọi Spring Boot
    if (userMsg.includes("sản phẩm")) {
      if (!jwtToken) return res.status(401).json({ error: "Missing jwt-token" });

      const resp = await axios.get(
        `${API_URL}/products?pageNumber=0&pageSize=5&sortBy=productId&sortOrder=asc`,
        { headers: { Authorization: jwtToken } }
      );

      const products = resp.data?.content || [];
      const reply = products.length > 0
        ? "Một số sản phẩm nổi bật:\n" +
          products.map((p) => `- ${p.name} (${p.price} VND)`).join("\n")
        : "Hiện chưa có sản phẩm nào.";

      return res.json({ reply });
    }

    // Ngược lại → gọi Gemini
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_KEY,
        },
        body: JSON.stringify({
          contents: messages.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
        }),
      }
    );

    const data = await r.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                  "Xin lỗi, chưa có phản hồi từ AI.";

    return res.json({ reply });
  } catch (e) {
    console.error("AI proxy error:", e?.response?.data || e.message);
    return res.status(500).json({ error: "AI proxy error" });
  }
});

// ✅ Route suggest AI (custom test)
router.post("/suggest", async (req, res) => {
  try {
    const { prompt } = req.body;
    const suggestion = `Gợi ý sản phẩm cho: ${prompt}`;
    res.json({ suggestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI suggestion failed" });
  }
});

// ✅ Route test products
router.get("/products", async (req, res) => {
  try {
    const clientToken = req.headers["authorization"];
    if (!clientToken) return res.status(401).json({ message: "Missing jwt-token" });

    const response = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: clientToken },
    });

    res.json(response.data);
  } catch (err) {
    console.error("AI proxy error:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;
