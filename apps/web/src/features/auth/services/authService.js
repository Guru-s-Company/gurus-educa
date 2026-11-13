import { apiClient } from "../../../services/api/client";

export const authService = {
  login(credentials, options = {}) {
    return apiClient.request("/auth/login", {
      method: "POST",
      body: credentials,
      signal: options.signal,
    });
  },

  register(data, options = {}) {
    return apiClient.request("/auth/register", {
      method: "POST",
      body: data,
      signal: options.signal,
    });
  },

  getCurrentUser(accessToken, options = {}) {
    return apiClient.request("/auth/me", {
      accessToken,
      signal: options.signal,
    });
  },

  refresh(refreshToken, options = {}) {
    return apiClient.request("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      signal: options.signal,
    });
  },

  logout(refreshToken, accessToken, options = {}) {
    return apiClient.request("/auth/logout", {
      method: "POST",
      body: { refreshToken },
      accessToken,
      signal: options.signal,
    });
  },
};
