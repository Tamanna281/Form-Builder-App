// client/src/services/authApi.js
import api from "./api";

export const registerUser = (data) =>
  api.post("/api/auth/register", data);

export const loginUser = (data) =>
  api.post("/api/auth/login", data);