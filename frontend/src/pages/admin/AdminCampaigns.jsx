import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getAdminCampaigns } from "../../services/adminService";

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCampaigns({
        page,
        limit: 10,
        search: search.trim(),
        status,
      });

      setCampaigns(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load campaigns."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [page]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    loadCampaigns();
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  useEffect(() => {
    if (page === 1) {
      loadCampaigns();
    }
  }, [status]);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Campaigns
          </h1>

          <p className="text-gray-500 mt-1">
            View campaigns created by MailQueue users.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-3 mb-6"
          >
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by campaign name..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              value={status}
              onChange={handleStatusChange}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
            >
              Search
            </button>
          </form>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No campaigns found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Campaign
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Owner
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign._id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-medium text-gray-800">
                        {campaign.name || "Untitled Campaign"}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {campaign.user
                          ? `${campaign.user.firstname || ""} ${
                              campaign.user.lastname || ""
                            }`.trim() || campaign.user.email
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            campaign.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : campaign.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : campaign.status === "processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : campaign.status === "queued"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {campaign.status || "unknown"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-500">
                        {campaign.createdAt
                          ? new Date(
                              campaign.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Previous
              </button>

              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
