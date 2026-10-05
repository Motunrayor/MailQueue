import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onNavigate }) {
  const { user } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      name: "Contacts",
      path: "/dashboard/contacts",
      icon: "👥",
    },
    {
      name: "Campaigns",
      path: "/dashboard/campaigns",
      icon: "✉",
    },
  ];

  // Add admin links only for admin users
  if (user?.role === "admin") {
    navItems.push(
      {
        name: "Admin",
        path: "/admin",
        icon: "⚙",
      },
      {
        name: "Admin Users",
        path: "/admin/users",
        icon: "👤",
      },
      {
        name: "Admin Campaigns",
        path: "/admin/campaigns",
        icon: "✉",
      }
    );
  }

  return (
    <aside
      id="dashboard-sidebar"
      className={`${isOpen ? "flex shadow-lg" : "hidden"} fixed top-16 bottom-0 left-0 z-30 w-64 overflow-y-auto bg-white border-r border-gray-200 flex-col md:flex md:shadow-none`}
    >
      {/* User section */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
            {user?.firstname?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              {user?.firstname || "User"} {user?.lastname || ""}
            </p>

            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "User"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
          Menu
        </p>

        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <span className="w-6 text-center">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-3 px-3">
          Account
        </p>

        <NavLink
          to="/dashboard/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition ${
              isActive
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`
          }
        >
          <span className="w-6 text-center">👤</span>
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          MailQueue
        </p>
      </div>
    </aside>
  );
}
