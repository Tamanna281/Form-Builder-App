import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const FormSubmissions = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const formRes = await axios.get(
          `http://localhost:5000/api/forms/${formId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const submissionsRes = await axios.get(
          `http://localhost:5000/api/forms/${formId}/submissions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setForm(formRes.data);
        setSubmissions(submissionsRes.data);
      } catch {
        setError("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId]);

  /*  STATES  */

  if (loading) {
    return <p className="text-slate-400">Loading submissions…</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-slate-900 p-4 text-red-400">
        {error}
      </div>
    );
  }

  if (!form) return null;

  /*  UI  */

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {form.name}
          </h2>
          <p className="text-sm text-slate-400">
            All submitted responses
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
        >
          Back
        </button>
      </div>

      {/* Empty state */}
      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
          <h3 className="text-lg font-medium text-white">
            No submissions yet
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Responses will appear here once submitted.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="min-w-full text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                {form.fields.map((f) => (
                  <th key={f.id} className="px-4 py-3 text-left">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((sub) => (
                <tr
                  key={sub._id}
                  onClick={() => setSelected(sub)}
                  className="cursor-pointer border-t border-slate-800 hover:bg-slate-800/50 transition"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {sub.submittedBy?.name || "Unknown"}
                  </td>

                  {form.fields.map((f) => (
                    <td key={f.id} className="px-4 py-3">
                      {sub.values?.[f.id] || "—"}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/forms/${form._id}/fill`;
                      }}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                    >
                      Fill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/*  PREVIEW PANEL  */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <h3 className="text-lg font-semibold text-white">
                Submission Preview
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <p className="mb-4 text-sm text-slate-400">
                {selected.submittedBy?.name || "Unknown user"}
              </p>

              <div className="space-y-4">
                {form.fields.map((field) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-slate-800 bg-slate-900 p-3"
                  >
                    <div className="text-xs uppercase text-slate-400 mb-1">
                      {field.label}
                    </div>
                    <div className="text-sm text-white">
                      {selected.values?.[field.id] || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSubmissions;
