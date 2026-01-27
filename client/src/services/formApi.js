import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/forms",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const saveForm = (form) => API.post("/", form);
export const getForms = () => API.get("/");
export const updateForm = (id, form) => API.put(`/${id}`, form);
export const deleteForm = (id) => API.delete(`/${id}`);
