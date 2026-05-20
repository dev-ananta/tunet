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

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    sendJson(response, 500, { error: "Supabase is not configured." });
    return;
  }

  try {
    const body =
      typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(response, 400, { error: "A valid email is required." });
      return;
    }

    const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/registrations`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        email,
        full_name: String(body.name || "").trim(),
        student_name: String(body.studentName || "").trim(),
        package_preference: String(body.packagePreference || "").trim(),
        message: String(body.message || "").trim()
      })
    });

    if (!supabaseResponse.ok) {
      const text = await supabaseResponse.text();
      sendJson(response, supabaseResponse.status, { error: text || "Registration failed." });
      return;
    }

    sendJson(response, 200, { ok: true });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Registration failed." });
  }
};
