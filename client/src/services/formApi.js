import api from "./api";

// --- FORMS ---

export const saveForm = (form) =>
  api.post("/api/forms", form);

export const getForms = () =>
  api.get("/api/forms");

export const getFormById = (id) => 
  api.get(`/api/forms/${id}`);

export const updateForm = (id, form) =>
  api.put(`/api/forms/${id}`, form);

export const deleteForm = (id) =>
  api.delete(`/api/forms/${id}`);


// --- SUBMISSIONS ---

export const createSubmission = (formId, data) =>
  api.post(`/api/forms/${formId}/submissions`, data);

export const getFormSubmissions = (formId) =>
  api.get(`/api/forms/${formId}/submissions`);

export const getSubmissionById = (id) =>
  api.get(`/api/forms/submissions/${id}`);

export const updateSubmission = (id, data) =>
  api.put(`/api/forms/submissions/${id}`, data);