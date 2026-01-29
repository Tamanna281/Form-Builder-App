import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

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
      className="cursor-grab rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 active:cursor-grabbing hover:text-white transition-colors"
    >
      <span className="mr-2 opacity-50">⋮⋮</span>
      {label}
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col p-4">
      
      {/* HEADER / USER INFO */}
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Form Builder</h2>
        {user && (
          <div className="mt-2 text-xs text-slate-500">
            <p className="font-medium text-slate-300">{user.name}</p>
            <p className="capitalize text-slate-600">{user.role}</p>
            {user.role === 'admin' && user.orgCode && (
              <div className="mt-2 inline-block rounded bg-blue-900/20 border border-blue-900/40 px-2 py-1 text-blue-400 font-mono">
                Code: {user.orgCode}
              </div>
            )}
          </div>
        )}
      </div>

      {/* NAVIGATION (Back Button) */}
      {!isDashboard && (
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <span className="text-lg">‹</span> Back to Dashboard
        </button>
      )}

      {/* ADMIN TOOLS (Only show for Admins) */}
      {user?.role === "admin" ? (
        <div className="flex-1">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Builder Tools
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
          
          <div className="mt-8 rounded-lg bg-slate-800/50 p-3 text-xs text-slate-500">
            <p>💡 Drag fields onto the canvas to add them to your form.</p>
          </div>
        </div>
      ) : (
        /* USER MENU (For Employees) */
        <div className="flex-1">
           <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </h3>
          <button 
            onClick={() => navigate("/dashboard")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${isDashboard ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Available Forms
          </button>
        </div>
      )}

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500 hover:text-white transition-all"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;