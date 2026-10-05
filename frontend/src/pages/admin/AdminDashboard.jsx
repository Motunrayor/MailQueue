import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { getAdminStats } from "../../services/adminService";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminStats();
        setStats(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const campaigns = stats?.campaigns || {};
  const jobs = stats?.jobs || {};

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: "👥",
    },
    {
      title: "Total Campaigns",
      value: stats?.totalCampaigns ?? 0,
      icon: "✉️",
    },
    {
      title: "Total Jobs",
      value: stats?.totalJobs ?? 0,
      icon: "⚙️",
    },
    {
      title: "Completed Campaigns",
      value: campaigns.completed ?? 0,
      icon: "✅",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Monitor MailQueue users, campaigns and email processing.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="text-3xl font-bold text-gray-800 mt-2">
                    {loading ? "..." : card.value}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-xl">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Campaign Status
            </h2>

            <div className="mt-5 space-y-4">
              <StatusRow
                label="Draft"
                value={campaigns.draft}
              />

              <StatusRow
                label="Queued"
                value={campaigns.queued}
              />

              <StatusRow
                label="Processing"
                value={campaigns.processing}
              />

              <StatusRow
                label="Completed"
                value={campaigns.completed}
              />

              <StatusRow
                label="Failed"
                value={campaigns.failed}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Job Status
            </h2>

            <div className="mt-5 space-y-4">
              <StatusRow
                label="Pending"
                value={jobs.pending}
              />

              <StatusRow
                label="Processing"
                value={jobs.processing}
              />

              <StatusRow
                label="Completed"
                value={jobs.completed}
              />

              <StatusRow
                label="Failed"
                value={jobs.failed}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                User Management
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                View registered MailQueue users.
              </p>
            </div>

            <Link
              to="/admin/users"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              View Users →
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusRow({ label, value = 0 }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>

      <span className="font-semibold text-gray-800">
        {value ?? 0}
      </span>
    </div>
  );
}
