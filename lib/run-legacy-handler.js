export async function runLegacyHandler(handler, request) {
  const url = new URL(request.url);
  const req = {
    method: request.method,
    query: Object.fromEntries(url.searchParams.entries()),
  };
  const headers = new Headers();
  let statusCode = 200;
  let body;
  let responded = false;
  const res = {
    setHeader(name, value) {
      headers.set(name, String(value));
      return this;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      body = value;
      responded = true;
      return this;
    },
  };

  try {
    await handler(req, res);
  } catch {
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }

  return responded
    ? Response.json(body, { status: statusCode, headers })
    : new Response(null, { status: statusCode, headers });
}