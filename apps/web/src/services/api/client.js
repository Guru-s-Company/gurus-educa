const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

export const apiClient = {
  async request(path, { method = "GET", body, headers = {}, signal, accessToken } = {}) {
    const requestHeaders = new Headers(headers);

    if (body !== undefined) {
      requestHeaders.set("Content-Type", "application/json");
    }

    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: requestHeaders,
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
    const payload = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(
        payload?.message || "Não foi possível concluir a requisição.",
        {
          status: response.status,
          code: payload?.error,
          details: payload?.details,
        },
      );
    }

    return payload;
  },
};
