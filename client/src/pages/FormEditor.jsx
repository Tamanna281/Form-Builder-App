import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const FormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 1. RBAC Check (Admin Only)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") {
        navigate("/dashboard"); // Kick non-admins out
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    // 2. Fetch Form Data
    const fetchForm = async () => {
      try {
        const res = await api.get(`/api/forms/${id}`);
        setForm(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load form details.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, navigate]);

  const handleFieldChange = (fieldId, key, value) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === fieldId ? { ...f, [key]: value } : f
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/forms/${id}`, {
        name: form.name,
        fields: form.fields,
      });
      navigate("/"); // Return to Dashboard
    } catch (err) {
      console.error(err);
      alert("Failed to save form");
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
          <p>{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm underline hover:text-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* --- UI --- */

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Edit Form Structure
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Refine labels and requirements for <span className="text-blue-400">{form.name}</span>
            </p>
          </div>
          <button
             onClick={() => navigate(-1)}
             className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition"
           >
             Cancel
           </button>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          
          {/* Form Name */}
          <div className="mb-8">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Form Name
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
            />
          </div>

          {/* Fields List */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Form Fields
            </label>
            
            {form.fields.map((field) => (
              <div
                key={field.id}
                className="group flex items-start gap-4 rounded-lg border border-slate-800 bg-slate-950/50 p-4 hover:border-slate-700 transition"
              >
                {/* Field Type Badge */}
                <div className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-900 text-xs font-bold uppercase text-slate-500 border border-slate-800">
                  {field.type.slice(0, 2)}
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500">Label Question</label>
                    <input
                      value={field.label}
                      onChange={(e) =>
                        handleFieldChange(field.id, "label", e.target.value)
                      }
                      className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 text-sm text-slate-400 hover:text-white cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        handleFieldChange(field.id, "required", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-offset-slate-900"
                    />
                    Mark as Required
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-800 pt-6">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
            >
              Discard
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 transition"
            >
              {saving ? "Saving Changes..." : "Save Updates"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FormEditor;