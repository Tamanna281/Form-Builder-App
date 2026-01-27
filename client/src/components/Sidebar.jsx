import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";

const FIELD_TEMPLATES = [
  { type: "text", label: "Text Field" },
  { type: "email", label: "Email Field" },
  { type: "textarea", label: "Textarea Field" },
];

const DraggableItem = ({ id, label }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 active:cursor-grabbing"
    >
      {label}
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col p-4">
      {/* TOP */}
      <div className="flex-1">
        <h3 className="mb-4 text-sm font-semibold text-slate-200">
          Form Fields
        </h3>

        <div className="space-y-2">
          {FIELD_TEMPLATES.map((field) => (
            <DraggableItem
              key={field.type}
              id={`template-${field.type}`}
              label={field.label}
            />
          ))}
        </div>
      </div>

      {/* BOTTOM */}
      <button
        onClick={handleLogout}
        className="mt-6 rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-400"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
