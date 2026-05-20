const pages = {
  home: "/landing.html",
  landing: "/landing.html",
  tutors: "/landing.html#tutors",
  pricing: "/landing.html#plans",
  plans: "/landing.html#plans",
  story: "/landing.html#story",
  register: "/sign-in.html",
  signin: "/sign-in.html",
  login: "/sign-in.html",
  dashboard: "/dashboard.html",
  payment: "/payment.html",
  checkout: "/payment.html",
  contact: "/contact.html"
};

const priceGuide = {
  singleSessionHours: 1,
  singleSessionPrice: 50,
  bundleHours: 3,
  bundlePrice: 120
};

const sendJson = (response, statusCode, payload) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
};

const readBody = async (request) => {
  if (request.body) {
    return typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
};

const buildSystemPrompt = () => `
You are Rahi, TuNet Barrington's concise AI assistant.
You help families navigate the site and calculate tutoring session prices.

Site navigation map:
${Object.entries(pages)
  .map(([name, path]) => `- ${name}: ${path}`)
  .join("\n")}

Pricing:
- Single session: $${priceGuide.singleSessionPrice} for ${priceGuide.singleSessionHours} credit hour.
- Bundle pack: $${priceGuide.bundlePrice} for ${priceGuide.bundleHours} credit hours.
- When calculating, use the cheapest mix of bundle packs and single sessions for the requested number of credit hours.

Return only compact JSON:
{
  "reply": "short helpful message",
  "action": { "type": "none" | "navigate", "target": "/allowed-path.html-or-anchor" }
}

Only use navigation targets listed in the map. Use "none" when no navigation is needed.
Do not ask for card details, passwords, medical details, or private student records.
`;

const calculatePriceContext = (message) => {
  const normalized = message.toLowerCase();
  if (!/(price|cost|calculate|how much|session|hour|credit)/.test(normalized)) {
    return "";
  }

  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(session|sessions|hour|hours|credit|credits)?/);
  if (!match) {
    return "";
  }

  const hours = Math.max(0, Number(match[1]));
  if (!Number.isFinite(hours) || hours <= 0 || !Number.isInteger(hours)) {
    return "";
  }

  const bundles = Math.floor(hours / priceGuide.bundleHours);
  const singles = hours % priceGuide.bundleHours;
  const bundledTotal = bundles * priceGuide.bundlePrice + singles * priceGuide.singleSessionPrice;
  const allSinglesTotal = hours * priceGuide.singleSessionPrice;
  const total = Math.min(bundledTotal, allSinglesTotal);

  return `Computed price context: ${hours} credit hour(s) costs $${total}. Cheapest mix: ${
    total === allSinglesTotal && allSinglesTotal < bundledTotal
      ? `${hours} single session(s)`
      : `${bundles} bundle pack(s) and ${singles} single session(s)`
  }.`;
};

const extractJson = (content) => {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { reply: content, action: { type: "none" } };
  }
};

module.exports = async (request, response) => {
  const hasApiKey = Boolean(process.env.RAHI_API_KEY);

  if (request.method === "GET") {
    sendJson(response, 200, { available: hasApiKey });
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  if (!hasApiKey) {
    sendJson(response, 404, { error: "Rahi is unavailable." });
    return;
  }

  try {
    const body = await readBody(request);
    const message = String(body.message || "").trim();
    const priceContext = calculatePriceContext(message);

    if (!message) {
      sendJson(response, 400, { error: "Message is required." });
      return;
    }

    const apiBaseUrl = process.env.RAHI_API_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.RAHI_MODEL || "gpt-4o-mini";
    const upstream = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RAHI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: priceContext ? `${message}\n\n${priceContext}` : message }
        ]
      })
    });

    const payload = await upstream.json();

    if (!upstream.ok) {
      sendJson(response, upstream.status, {
        error: payload.error?.message || "Rahi could not answer right now."
      });
      return;
    }

    const content = payload.choices?.[0]?.message?.content || "";
    const result = extractJson(content);
    const target = result.action?.target;

    if (result.action?.type === "navigate" && !Object.values(pages).includes(target)) {
      result.action = { type: "none" };
    }

    sendJson(response, 200, {
      reply: result.reply || "I can help with tutoring plans, pricing, and finding the right page.",
      action: result.action || { type: "none" }
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Rahi could not answer right now." });
  }
};
