import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  saveForm,
  getForms,
  updateForm,
  deleteForm,
} from "../services/formApi";
import Sidebar from "../components/Sidebar"; // Import Sidebar

import { DndContext, closestCenter, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- COMPONENTS (SortableField, Canvas) ---

const SortableField = ({ field, setFields }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[24px_1fr] gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400"
      >
        ⠿
      </div>

      <div className="space-y-2">
        <span className="text-xs text-slate-400 uppercase">{field.type}</span>

        <input
          value={field.label}
          onChange={(e) =>
            setFields((prev) =>
              prev.map((f) =>
                f.id === field.id ? { ...f, label: e.target.value } : f,
              ),
            )
          }
          className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-sm text-white"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                setFields((prev) =>
                  prev.map((f) =>
                    f.id === field.id
                      ? { ...f, required: e.target.checked }
                      : f,
                  ),
                )
              }
            />
            Required
          </label>

          <button
            onClick={() =>
              setFields((prev) => prev.filter((f) => f.id !== field.id))
            }
            className="rounded-md bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Canvas = ({ fields, setFields }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 overflow-y-auto rounded-xl border-2 border-dashed p-4 transition
        ${isOver ? "border-blue-500 bg-blue-500/5" : "border-slate-700"}`}
    >
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Form Fields</h3>

      {fields.length === 0 && (
        <div className="rounded-lg bg-slate-800/50 p-4 text-center text-sm text-slate-400">
          Drag fields here
        </div>
      )}

      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {fields.map((field) => (
            <SortableField key={field.id} field={field} setFields={setFields} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// --- MAIN PAGE ---

const FormBuilder = () => {
  const navigate = useNavigate();

  // State
  const [user, setUser] = useState(null);
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState([]);
  const [savedForms, setSavedForms] = useState([]);
  const [editingFormId, setEditingFormId] = useState(null);
  const [previewForm, setPreviewForm] = useState(null);

  // Initialize
  useEffect(() => {
    // 1. Load User
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Fetch Forms (Backend handles filtering based on role)
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await getForms();
      setSavedForms(
        res.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      );
    } catch (err) {
      console.error("Failed to load forms", err);
    }
  };

  const handleSave = async () => {
    if (!formName || fields.length === 0) return;

    if (editingFormId) {
      await updateForm(editingFormId, { name: formName, fields });
    } else {
      await saveForm({ name: formName, fields });
    }

    fetchForms();
    resetBuilder();
  };

  const loadForm = (form) => {
    // Only Admins can load form into Builder
    if (user?.role !== "admin") return;
    setFormName(form.name);
    setFields(form.fields);
    setEditingFormId(form._id);
  };

  const resetBuilder = () => {
    setFormName("");
    setFields([]);
    setEditingFormId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this form?")) return;
    await deleteForm(id);
    fetchForms();
  };

  // --- RENDER LOGIC: USER VIEW ---
  // FIXED: Now wraps the dashboard in a flex container with <Sidebar />
  if (user && user.role === "user") {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex">
        {/* SIDEBAR ADDED HERE */}
        <Sidebar />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Employee Dashboard
                </h1>
                <p className="text-slate-400 text-sm">Forms assigned to you</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">
                  Logged in as
                </span>
                <span className="text-sm font-medium text-white">
                  {user.name}
                </span>
              </div>
            </div>

            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedForms.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                  No forms available at the moment.
                </div>
              ) : (
                savedForms.map((form) => (
                  <div
                    key={form._id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {form.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                      {form.fields.length} questions
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(`/forms/${form._id}/fill`)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition"
                      >
                        <span>Fill Form</span>
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/forms/${form._id}/submissions`)
                        }
                        className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
                      >
                        <span>My History</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER LOGIC: ADMIN VIEW ---
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over) return;

        // Create new field from sidebar
        if (active.id.startsWith("template-") && over.id === "canvas") {
          const type = active.id.replace("template-", "");
          setFields((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type,
              label: `${type} field`,
              required: false,
            },
          ]);
          return;
        }

        // Reorder fields
        if (active.id !== over.id) {
          setFields((prev) => {
            const oldIndex = prev.findIndex((f) => f.id === active.id);
            const newIndex = prev.findIndex((f) => f.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return prev;

            const updated = [...prev];
            const [moved] = updated.splice(oldIndex, 1);
            updated.splice(newIndex, 0, moved);
            return updated;
          });
        }
      }}
    >
      <div className="min-h-screen w-full bg-slate-950 flex">
        <Sidebar />

        <div className="flex-1 grid grid-cols-[1fr_380px] gap-6 p-6">
          {/* BUILDER AREA */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-4 h-[calc(100vh-3rem)]">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                {editingFormId ? "Edit Form" : "Create New Form"}
              </h2>
              {user?.orgCode && (
                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded border border-blue-900/50">
                  Org Code: {user.orgCode}
                </span>
              )}
            </div>

            <input
              placeholder="Form name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="mb-4 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-600 outline-none transition"
            />

            <Canvas fields={fields} setFields={setFields} />

            <div className="mt-4 flex gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                {editingFormId ? "Update Form" : "Save Form"}
              </button>

              <button
                onClick={resetBuilder}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
              >
                Reset
              </button>

              <button
                onClick={() => setPreviewForm({ name: formName, fields })}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 ml-auto"
              >
                Preview
              </button>
            </div>
          </div>

          {/* SAVED FORMS LIST (ADMIN VIEW) */}
          <div className="h-[calc(100vh-3rem)] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              Your Forms
            </h3>

            {savedForms.length === 0 && (
              <p className="text-sm text-slate-500 italic">
                No forms created yet.
              </p>
            )}

            {savedForms.map((form) => (
              <div
                key={form._id}
                className={`mb-4 rounded-lg border p-3 transition-colors ${
                  editingFormId === form._id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >
                <div
                  onClick={() => loadForm(form)}
                  className="cursor-pointer mb-3"
                >
                  <h4 className="text-sm font-medium text-white">
                    {form.name}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {form.fields.length} fields •{" "}
                    {new Date(form.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadForm(form)}
                    className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => navigate(`/forms/${form._id}/submissions`)}
                    className="rounded bg-emerald-600/20 border border-emerald-600/30 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-600/30"
                  >
                    Data
                  </button>

                  <button
                    onClick={() => handleDelete(form._id)}
                    className="rounded bg-red-500/10 border border-red-500/20 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PREVIEW MODAL */}
        {previewForm && (
          <div
            onClick={() => setPreviewForm(null)}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="h-full w-[420px] bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto shadow-2xl"
            >
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Preview</h3>
                <button
                  onClick={() => setPreviewForm(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {previewForm.name || "Untitled Form"}
                  </h2>
                  <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
                </div>

                {previewForm.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-400">*</span>
                      )}
                    </label>
                    <div className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-500 italic">
                      {field.type} input placeholder...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default FormBuilder;
