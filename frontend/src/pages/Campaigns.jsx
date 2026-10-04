import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";

import {
  getCampaigns,
  deleteCampaign,
} from "../services/campaignService";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCampaigns();

      setCampaigns(data.data || []);
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
  }, []);

  const handleDelete = async (campaign) => {
    if (campaign.status !== "draft") return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${campaign.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteCampaign(campaign._id);

      setCampaigns((previous) =>
        previous.filter(
          (item) => item._id !== campaign._id
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete campaign."
      );
    }
  };

  const getRecipientCount = (campaign) => {
    if (campaign.totalRecipients > 0) {
      return campaign.totalRecipients;
    }

    return Array.isArray(campaign.recipients)
      ? campaign.recipients.length
      : 0;
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Campaigns
            </h1>

            <p className="text-gray-500 mt-1">
              Create and manage your email campaigns.
            </p>
          </div>

          <Link
            to="/dashboard/campaigns/create"
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium text-center"
          >
            + Create Campaign
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">✉️</div>

              <h2 className="font-semibold text-gray-800">
                No campaigns yet
              </h2>

              <p className="text-gray-500 mt-1">
                Create your first campaign to get started.
              </p>

              <Link
                to="/dashboard/campaigns/create"
                className="inline-block mt-5 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium"
              >
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Campaign
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Recipients
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Created
                    </th>

                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((campaign) => {
                    const isDraft =
                      campaign.status === "draft";

                    return (
                      <tr
                        key={campaign._id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/dashboard/campaigns/${campaign._id}`}
                            className="font-semibold text-gray-800 hover:text-green-600"
                          >
                            {campaign.name}
                          </Link>

                          <p className="text-sm text-gray-500 mt-1">
                            {campaign.subject}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={campaign.status}
                          />
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {getRecipientCount(campaign)}
                        </td>

                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {campaign.createdAt
                            ? new Date(
                                campaign.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end items-center gap-3">
                            <Link
                              to={`/dashboard/campaigns/${campaign._id}`}
                              className="text-green-600 hover:text-green-700 font-medium text-sm"
                            >
                              View
                            </Link>

                            {isDraft && (
                              <>
                                <Link
                                  to={`/dashboard/campaigns/${campaign._id}/edit`}
                                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                  Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(campaign)
                                  }
                                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}