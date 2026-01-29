import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const FormSubmissions = () => {
  const { id: formId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Load User Info
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // 2. Fetch Data
    const fetchData = async () => {
      try {
        const [formRes, submissionsRes] = await Promise.all([
          api.get(`/api/forms/${formId}`),
          api.get(`/api/forms/${formId}/submissions`),
        ]);

        setForm(formRes.data);
        setSubmissions(submissionsRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load data. You might not have permission.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId]);

  /* STATES */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl mt-10 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
        <p className="font-semibold">Access Error</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => navigate("/")}
          className="mt-4 text-sm underline hover:text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!form) return null;

  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-white tracking-tight">
              {form.name}
            </h2>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
              {submissions.length} Submissions
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {isAdmin 
              ? "Viewing all submissions from your organization." 
              : "Viewing your personal submission history."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            Back to Dashboard
          </button>
          
          {/* Users can submit new ones from here too */}
          {!isAdmin && (
             <button
              onClick={() => navigate(`/forms/${formId}/fill`)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition"
            >
              Submit New
            </button>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">No submissions found</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            {isAdmin 
              ? "No employees have submitted this form yet." 
              : "You haven't submitted this form yet."}
          </p>
          {!isAdmin && (
            <button
              onClick={() => navigate(`/forms/${formId}/fill`)}
              className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Start First Submission
            </button>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  {/* ADMIN ONLY: Show who submitted it */}
                  {isAdmin && (
                    <th className="px-6 py-4 font-semibold">Submitted By</th>
                  )}
                  
                  {/* Show first 3 fields as columns to prevent overflow */}
                  {form.fields.slice(0, 3).map((f) => (
                    <th key={f.id} className="px-6 py-4 font-semibold">
                      {f.label}
                    </th>
                  ))}
                  
                  <th className="px-6 py-4 font-semibold text-right">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {submissions.map((sub) => (
                  <tr
                    key={sub._id}
                    onClick={() => setSelected(sub)}
                    className="cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    {/* ADMIN: User Name */}
                    {isAdmin && (
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-white">
                          {sub.submittedBy?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {sub.submittedBy?.email}
                        </div>
                      </td>
                    )}

                    {/* Form Data Columns */}
                    {form.fields.slice(0, 3).map((f) => (
                      <td key={f.id} className="whitespace-nowrap px-6 py-4 text-slate-400">
                        {sub.values?.[f.id] ? (
                          <span className="block max-w-[150px] truncate">
                            {sub.values[f.id]}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    ))}

                    <td className="whitespace-nowrap px-6 py-4 text-right text-xs text-slate-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(sub);
                          }}
                          className="rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-slate-700"
                        >
                          View
                        </button>
                        
                        {/* EDIT BUTTON */}
                        <button
                           onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/submissions/${sub._id}/edit`);
                           }}
                           className="rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                         >
                           Edit
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SLIDE-OVER PREVIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelected(null)}>
          <div 
            className="h-full w-full max-w-md bg-slate-900 shadow-2xl border-l border-slate-800 transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div>
                <h3 className="text-lg font-bold text-white">Submission Details</h3>
                <p className="text-xs text-slate-500">ID: {selected._id}</p>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="h-[calc(100vh-80px)] overflow-y-auto p-6">
              {isAdmin && (
                <div className="mb-6 rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Submitted By</h4>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {selected.submittedBy?.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{selected.submittedBy?.name}</p>
                      <p className="text-xs text-slate-400">{selected.submittedBy?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {form.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      {field.label}
                    </label>
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
                      {selected.values?.[field.id] || <span className="text-slate-600 italic">No answer</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 border-t border-slate-800 pt-6">
                 <button
                   onClick={() => navigate(`/submissions/${selected._id}/edit`)}
                   className="w-full rounded-lg bg-slate-800 py-3 text-sm font-medium text-white hover:bg-slate-700"
                 >
                   Edit Submission
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSubmissions;