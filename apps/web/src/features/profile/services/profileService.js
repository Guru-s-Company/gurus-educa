import { apiClient } from "../../../services/api/client";

export const profileService = {
  getMyProfile(accessToken, options = {}) {
    return apiClient.request("/profile/me", {
      accessToken,
      signal: options.signal,
    });
  },

  updateMyProfile(data, accessToken, options = {}) {
    return apiClient.request("/profile/me", {
      method: "PATCH",
      body: data,
      accessToken,
      signal: options.signal,
    });
  },
};
