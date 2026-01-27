// client/src/services/formApi.js
import api from "./api";

export const saveForm = (form) =>
  api.post("/api/forms", form);

export const getForms = () =>
  api.get("/api/forms");

export const updateForm = (id, form) =>
  api.put(`/api/forms/${id}`, form);

export const deleteForm = (id) =>
  api.delete(`/api/forms/${id}`);
