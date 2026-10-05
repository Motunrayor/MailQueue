import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />

      <div className="flex pt-16">
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-x-0 top-16 bottom-0 z-20 bg-black/30 md:hidden"
          />
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          onNavigate={() => setIsSidebarOpen(false)}
        />

        <div className="hidden md:block w-64 shrink-0" aria-hidden="true" />

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
