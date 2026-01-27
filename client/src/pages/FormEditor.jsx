import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const FormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/forms/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setForm(res.data);
      } catch (err) {
        setError("Failed to load form");
      }
    };

    fetchForm();
  }, [id]);

  const handleFieldChange = (fieldId, key, value) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === fieldId ? { ...f, [key]: value } : f
      ),
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/forms/${id}`,
        {
          name: form.name,
          fields: form.fields,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/");
    } catch (err) {
      alert("Failed to save form");
    }
  };

  /*  STATES  */

  if (error) {
    return (
      <div className="text-red-400 bg-slate-900 border border-red-500/30 rounded-lg p-4">
        {error}
      </div>
    );
  }

  if (!form) {
    return <p className="text-slate-400">Loading...</p>;
  }

  /*  UI  */

  return (
  <div className="mx-auto max-w-5xl px-6 py-10">
    {/* Page shell */}
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
      <div className="p-8">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-white">
            Edit Form
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Update form structure and field settings
          </p>
        </div>

        {/* Form Name */}
        <div className="mb-10">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">
            Form Name
          </label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Fields */}
        <div className="space-y-6">
          {form.fields.map((field) => (
            <div
              key={field.id}
              className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                  {field.type} field
                </span>
              </div>

              <input
                value={field.label}
                onChange={(e) =>
                  handleFieldChange(
                    field.id,
                    "label",
                    e.target.value
                  )
                }
                className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    handleFieldChange(
                      field.id,
                      "required",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                />
                Required
              </label>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-10 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  </div>
);

};

export default FormEditor;
