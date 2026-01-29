import axios from "axios";

// console.log("API URL:", import.meta.env.VITE_API_URL); // Optional debugging

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// --- REQUEST INTERCEPTOR ---
// Attaches the JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
// Global error handling (e.g., auto-logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server says "Unauthorized" (Token expired or invalid)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out...");
      
      // 1. Clear Local Storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");

      // 2. Force Redirect to Login
      // Since we are outside a React component, we use window.location
      // We check for HashRouter (#) usage to redirect correctly
      if (window.location.hash) {
        window.location.href = "/#/login";
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;