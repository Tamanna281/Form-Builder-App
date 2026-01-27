// client/src/layouts/AppLayout.jsx
import Sidebar from "../components/Sidebar";
import { DndContext, closestCenter } from "@dnd-kit/core";

export default function AppLayout({ children, onDragEnd }) {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="min-h-screen w-full bg-slate-950 flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </DndContext>
  );
}
