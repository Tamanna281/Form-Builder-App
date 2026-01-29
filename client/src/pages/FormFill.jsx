import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

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
        const res = await api.get(`/api/forms/${formId}`);
        setForm(res.data);

        // Initialize values
        const initialValues = {};
        res.data.fields.forEach((f) => {
          initialValues[f.id] = "";
        });
        setValues(initialValues);
      } catch (err) {
        console.error(err);
        setError("Unable to load this form. It may not exist or you don't have permission.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser submit
    
    // Frontend validation
    const missingRequired = form.fields.some(
      (f) => f.required && !values[f.id]?.trim()
    );

    if (missingRequired) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/api/forms/${formId}/submissions`, { values });
      
      // Navigate back to Dashboard or Submissions list
      navigate("/dashboard"); 
    } catch (err) {
      console.error(err);
      alert("Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
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
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!form) return null;

  /* --- UI --- */

  return (
    <div className="min-h-screen w-full bg-slate-950 px-6 py-12 flex justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
            <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
            ‹ Back
            </button>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
          
          {/* Form Title Banner */}
          <div className="border-b border-slate-800 bg-slate-900/50 p-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {form.name}
            </h2>
            <p className="text-sm text-slate-400">
              Please complete the form below. Fields marked with <span className="text-red-400">*</span> are required.
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-slate-300"
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
                      value={values[field.id] || ""}
                      required={field.required}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition placeholder:text-slate-600"
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                    />
                  ) : (
                    <input
                      id={field.id}
                      type={field.type}
                      value={values[field.id] || ""}
                      required={field.required}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition placeholder:text-slate-600"
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                    />
                  )}
                </div>
              ))}

              <div className="mt-10 pt-6 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
                >
                  {submitting ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormFill;