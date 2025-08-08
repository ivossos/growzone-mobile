const appJson = require("./app.json");
require("dotenv").config();

module.exports = () => {
  const expoConfig = appJson.expo || {};

  const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL || "https://dev.auth.growzone.co/api/v1";
  const SOCIAL_API_URL = process.env.EXPO_PUBLIC_SOCIAL_API_URL || "https://dev.social.growzone.co/api/v1";

  return {
    expo: {
      ...expoConfig,
      extra: {
        ...(expoConfig.extra || {}),
        AUTH_API_URL,
        SOCIAL_API_URL,
      },
    },
  };
}; 