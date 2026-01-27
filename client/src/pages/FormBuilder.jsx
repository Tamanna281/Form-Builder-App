import { useEffect, useState } from "react";
import { saveForm, getForms, updateForm, deleteForm } from "../services/formApi";
import Sidebar from "../components/Sidebar";

import { DndContext, closestCenter, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* 
   SORTABLE FIELD
 */
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
        <span className="text-xs text-slate-400 uppercase">
          {field.type}
        </span>

        <input
          value={field.label}
          onChange={(e) =>
            setFields((prev) =>
              prev.map((f) =>
                f.id === field.id ? { ...f, label: e.target.value } : f
              )
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
                      : f
                  )
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

/* 
   CANVAS
 */
const Canvas = ({ fields, setFields }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 overflow-y-auto rounded-xl border-2 border-dashed p-4 transition
        ${isOver ? "border-blue-500 bg-blue-500/5" : "border-slate-700"}`}
    >
      <h3 className="mb-3 text-sm font-semibold text-slate-200">
        Form Fields
      </h3>

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
            <SortableField
              key={field.id}
              field={field}
              setFields={setFields}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

/* 
   MAIN BUILDER
 */
const FormBuilder = () => {
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState([]);
  const [savedForms, setSavedForms] = useState([]);
  const [editingFormId, setEditingFormId] = useState(null);
  const [previewForm, setPreviewForm] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    const res = await getForms();
    setSavedForms(
      res.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  const handleSave = async () => {
    if (!formName || fields.length === 0) return;

    if (editingFormId) {
      await updateForm(editingFormId, { name: formName, fields });
    } else {
      await saveForm({ name: formName, fields });
    }

    fetchForms();
  };

  const loadForm = (form) => {
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

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over) return;

        // Create new field from sidebar
        if (
          active.id.startsWith("template-") &&
          over.id === "canvas"
        ) {
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
          {/* BUILDER */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-4 h-[calc(100vh-3rem)]">
            <input
              placeholder="Form name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="mb-4 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
            />

            <Canvas fields={fields} setFields={setFields} />

            <div className="mt-4 flex gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
              >
                {editingFormId ? "Update" : "Save"}
              </button>

              <button
                onClick={resetBuilder}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
              >
                New
              </button>

              <button
                onClick={() =>
                  setPreviewForm({ name: formName, fields })
                }
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
              >
                Preview
              </button>
            </div>
          </div>

          {/* SAVED FORMS */}
          <div className="h-[calc(100vh-3rem)] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              Saved Forms
            </h3>

            {savedForms.map((form) => (
              <div
                key={form._id}
                className="mb-4 rounded-lg border border-slate-800 bg-slate-950 p-3"
              >
                <div
                  onClick={() => loadForm(form)}
                  className="cursor-pointer"
                >
                  <h4 className="text-sm font-medium text-white">
                    {form.name}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {form.fields.length} fields
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      (window.location.href = `/forms/${form._id}/edit`)
                    }
                    className="rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-200"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      (window.location.href = `/forms/${form._id}/fill`)
                    }
                    className="rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-200"
                  >
                    Fill
                  </button>

                  <button
                    onClick={() =>
                      (window.location.href = `/forms/${form._id}/submissions`)
                    }
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white"
                  >
                    Submissions
                  </button>

                  <button
                    onClick={() => handleDelete(form._id)}
                    className="rounded-md bg-red-500 px-3 py-1 text-xs text-white"
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
            className="fixed inset-0 z-50 flex justify-end bg-black/60"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="h-full w-[420px] bg-slate-900 p-4 overflow-y-auto"
            >
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">
                  Form Preview
                </h3>
                <button
                  onClick={() => setPreviewForm(null)}
                  className="text-slate-400"
                >
                  ✕
                </button>
              </div>

              <p className="mb-4 text-sm text-slate-400">
                <strong>{previewForm.name}</strong>
              </p>

              <div className="space-y-4">
                {previewForm.fields.map((field) => (
                  <div key={field.id}>
                    <span className="text-xs text-slate-400">
                      {field.label}
                    </span>
                    <div className="mt-1 rounded-md border border-slate-800 bg-slate-950 p-2 text-sm text-slate-500">
                      {field.type === "email" && "example@email.com"}
                      {field.type === "text" && "Sample text"}
                      {field.type === "textarea" && "Sample long text"}
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
