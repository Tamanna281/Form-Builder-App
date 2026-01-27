// client/src/pages/FormFill.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const FormFill = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE_URL}/api/forms/${formId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setForm(res.data);

        const initialValues = {};
        res.data.fields.forEach((f) => {
          initialValues[f.id] = "";
        });
        setValues(initialValues);
      } catch (err) {
        console.error(err);
        setError("Unable to load this form.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    // Frontend validation
    const missingRequired = form.fields.some(
      (f) => f.required && !values[f.id]?.trim()
    );

    if (missingRequired) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE_URL}/api/forms/${formId}/submissions`,
        { values },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  /*  STATES  */

  if (loading) {
    return (
      <div className="form-fill-state">
        Loading form…
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-fill-state error">
        {error}
      </div>
    );
  }

  if (!form) return null;

  /*  UI  */

  return (
  <div className="mx-auto max-w-3xl px-6 py-12">
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl">
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white">
            {form.name}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Please fill out the details below
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-6">
          {form.fields.map((field) => (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                {field.label}
                {field.required && (
                  <span className="ml-1 text-red-400">*</span>
                )}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  rows={4}
                  value={values[field.id]}
                  required={field.required}
                  onChange={(e) =>
                    handleChange(field.id, e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              ) : (
                <input
                  id={field.id}
                  type={field.type}
                  value={values[field.id]}
                  required={field.required}
                  onChange={(e) =>
                    handleChange(field.id, e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-10 flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60 shadow-lg shadow-blue-600/20 transition"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>

      </div>
    </div>
  </div>
);

};

export default FormFill;
