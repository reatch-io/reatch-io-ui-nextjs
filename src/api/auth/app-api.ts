import axios from "axios";
import { getAccessToken } from "@auth0/nextjs-auth0";

const api = axios.create();

api.defaults.baseURL = process.env.API_BASE_URL || "http://localhost:9090";

api.interceptors.request.use(async (config) => {
  try {
    const accessToken = await getAccessToken();
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  } catch (e) {
    window.location.href = "/auth/login";
    return Promise.reject(e);
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      setTimeout(() => {
        alert("Your session has expired. Please log in again.");
        window.location.href = "/auth/login";
      }, 0);
    }
    return Promise.reject(error);
  }
);


export default api;
