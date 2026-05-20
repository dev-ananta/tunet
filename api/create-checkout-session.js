const stripeApi = "https://api.stripe.com/v1/checkout/sessions";

const priceMap = {
  initial: process.env.STRIPE_PRICE_INITIAL_SESSION,
  package: process.env.STRIPE_PRICE_THREE_CREDIT_BUNDLE
};

const sendJson = (response, statusCode, payload) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
};

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    sendJson(response, 500, { error: "Stripe is not configured." });
    return;
  }

  try {
    const body =
      typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const priceId = priceMap[body.priceKey];

    if (!priceId) {
      sendJson(response, 400, { error: "Unknown checkout package." });
      return;
    }

    const origin =
      process.env.PUBLIC_SITE_URL ||
      `${request.headers["x-forwarded-proto"] || "https"}://${request.headers.host}`;

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("success_url", `${origin}/dashboard.html?checkout=success`);
    params.set("cancel_url", `${origin}/payment.html?checkout=cancelled`);
    params.set("allow_promotion_codes", "true");
    params.set("billing_address_collection", "auto");

    if (body.customerEmail) {
      params.set("customer_email", body.customerEmail);
    }

    if (body.customerName) {
      params.set("metadata[customer_name]", body.customerName);
    }

    const stripeResponse = await fetch(stripeApi, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const payload = await stripeResponse.json();

    if (!stripeResponse.ok) {
      sendJson(response, stripeResponse.status, {
        error: payload.error?.message || "Stripe checkout failed."
      });
      return;
    }

    sendJson(response, 200, { url: payload.url });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Checkout failed." });
  }
};
