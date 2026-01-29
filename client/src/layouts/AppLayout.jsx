import Sidebar from "../components/Sidebar";
import { DndContext, closestCenter } from "@dnd-kit/core";

export default function AppLayout({ children }) {
  // A no-op handler. 
  // We keep DndContext here so the Sidebar (which has draggable items for Admins)
  // doesn't crash when rendered on non-builder pages.
  const handleDragEnd = () => {};

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen w-full bg-slate-950 flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </DndContext>
  );
}