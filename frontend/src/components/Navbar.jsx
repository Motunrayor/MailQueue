
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ isSidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={
                isSidebarOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isSidebarOpen}
              aria-controls="dashboard-sidebar"
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg
                aria-hidden="true"
                className={`w-5 h-5 transition-transform ${isSidebarOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
                <path d="m9 9 3 3 3-3" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>

              <span className="text-xl font-bold text-gray-800">
                MailQueue
              </span>
            </Link>
          </div>

          {/* User section */}
            <div className="flex items-center gap-8">
                <div className="flex justify-center items-center gap-3">
                    {/* Profile icon */}
                    <Link
                    to="/dashboard/profile"
                    className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold"
                    >
                    {user?.firstname?.charAt(0)?.toUpperCase() || "U"}
                    </Link>
                    <Link
                    to="/dashboard/profile"
                    className="hidden sm:block text-left hover:opacity-80"
                    >
                    <p className="text-sm font-semibold text-gray-800">
                        {user?.firstname || "User"}{" "}
                        {user?.lastname || ""}
                    </p>

                    <p className="text-xs text-gray-500">
                        {user?.role || "User"}
                    </p>
                    </Link>
                </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:text-red-700 cursor-pointer bg-red-50 px-4.5 py-2 rounded-lg  "
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
