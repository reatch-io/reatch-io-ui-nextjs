import axios from "axios";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/dist/server/api-utils";

const api = axios.create();

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
      // Redirect to login page
      alert("Your session has expired. Please log in again.");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);


export default api;
