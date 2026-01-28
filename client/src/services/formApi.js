// client/src/services/formApi.js
import api from "./api";

export const saveForm = (form) =>
  api.post("/forms", form);

export const getForms = () =>
  api.get("/forms");

export const updateForm = (id, form) =>
  api.put(`/forms/${id}`, form);

export const deleteForm = (id) =>
  api.delete(`/forms/${id}`);
