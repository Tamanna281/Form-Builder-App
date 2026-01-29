import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const EditSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get the submission to find out which form it belongs to
        // Note: Ensure your backend has a GET /api/submissions/:id route!
        // If not, you might need to add it to your server/routes/formRoutes.js
        const subRes = await api.get(`/api/submissions/${submissionId}`);
        
        setSubmission(subRes.data);
        setValues(subRes.data.values || {});

        // 2. Get the form schema to know fields/labels
        const formRes = await api.get(`/api/forms/${subRes.data.formId}`);
        setForm(formRes.data);
      } catch (err) {
        console.error("Load Error:", err);
        setError("Failed to load submission. You might not have permission.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId]);

  const handleChange = (fieldId, value) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/submissions/${submissionId}`, { values });
      // Go back to the previous page (Submissions List)
      navigate(-1);
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save revision. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* --- STATES --- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
          <p className="font-semibold mb-2">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-sm underline hover:text-white"
          >
            Return Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* --- UI --- */

  return (
    <div className="min-h-screen w-full bg-slate-950 p-6 flex justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Edit Submission</h1>
            <p className="text-sm text-slate-400">
              Updating response for <span className="text-blue-400">{form.name}</span>
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            Cancel
          </button>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <form onSubmit={handleSave} className="space-y-6">
            
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                
                {field.type === "textarea" ? (
                  <textarea
                    required={field.required}
                    value={values[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
                  />
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    value={values[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
                  />
                )}
              </div>
            ))}

            <div className="border-t border-slate-800 pt-6 flex justify-end gap-3">
               <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Discard Changes
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-900/20"
              >
                {saving ? "Saving Revision..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSubmission;