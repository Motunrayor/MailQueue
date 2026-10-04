import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";

import {
  getCampaignById,
  getCampaignNotifications,
  sendCampaign,
} from "../services/campaignService";

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingNotifications, setLoadingNotifications] =
    useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [notificationError, setNotificationError] =
    useState("");

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCampaignById(id);

      setCampaign(data.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load campaign."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const data = await getCampaignNotifications(id);

      setNotifications(data.data || []);
    } catch (error) {
      setNotificationError(
        error.response?.data?.message ||
          "Unable to load notification results."
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadCampaign();
    loadNotifications();
  }, [id]);

  const handleSend = async () => {
    const confirmed = window.confirm(
      "Send this campaign? It will be queued for background processing."
    );

    if (!confirmed) return;

    try {
      setSending(true);
      setError("");

      await sendCampaign(id);

      setError("");

      await Promise.all([loadCampaign(), loadNotifications()]);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to queue campaign."
      );
    } finally {
      setSending(false);
    }
  };

  const canSend = campaign?.status === "draft";

  const canEdit = campaign?.status === "draft";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">
          Loading campaign...
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error || "Campaign not found."}
          </div>

          <Link
            to="/dashboard/campaigns"
            className="inline-block mt-4 text-green-600 font-medium"
          >
            ← Back to campaigns
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalRecipients =
    campaign.totalRecipients ??
    campaign.recipients?.length ??
    0;

  const processedCount = campaign.processedCount ?? 0;
  const successCount = campaign.successCount ?? 0;
  const failedCount = campaign.failedCount ?? 0;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <Link
              to="/dashboard/campaigns"
              className="text-sm text-gray-500 hover:text-green-600"
            >
              ← Back to campaigns
            </Link>

            <h1 className="text-2xl font-bold text-gray-800 mt-3">
              {campaign.name}
            </h1>

            <div className="mt-2">
              <StatusBadge status={campaign.status} />
            </div>
          </div>

          <div className="flex gap-3">
            {canEdit && (
              <Link
                to={`/dashboard/campaigns/${campaign._id}/edit`}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Edit
              </Link>
            )}

            {canSend && (
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50"
              >
                {sending
                  ? "Queuing..."
                  : "Send Campaign"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Campaign details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Campaign Message
            </h2>

            <div className="mb-5">
              <p className="text-sm text-gray-500">
                Subject
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {campaign.subject}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">
                Message
              </p>

              <div className="bg-gray-50 rounded-lg p-5 whitespace-pre-wrap text-gray-700 leading-relaxed">
                {campaign.message ||
                  campaign.body ||
                  "No message provided."}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Campaign Progress
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={campaign.status}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Recipients
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {totalRecipients}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Processed
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {processedCount}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Successful
                </p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  {successCount}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Failed
                </p>

                <p className="text-2xl font-bold text-red-600 mt-1">
                  {failedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div className="bg-white rounded-xl shadow-sm mt-6 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Recipients
          </h2>

          {campaign.recipients?.length ? (
            <div className="divide-y divide-gray-100">
              {campaign.recipients.map((recipient, index) => {
                const contact =
                  typeof recipient === "object"
                    ? recipient
                    : null;

                return (
                  <div
                    key={
                      contact?._id ||
                      recipient ||
                      index
                    }
                    className="py-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                      {contact?.full_name
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                    </div>

                    <div>
                      <p className="font-medium text-gray-800">
                        {contact?.full_name ||
                          "Recipient"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {contact?.email ||
                          "Contact ID: " + recipient}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">
              No recipients found.
            </p>
          )}
        </div>

        {/* Notification results */}
        <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Delivery Results
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Results from the email worker.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                loadCampaign();
                loadNotifications();
              }}
              disabled={loadingNotifications}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingNotifications
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {notificationError && (
            <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {notificationError}
            </div>
          )}

          {loadingNotifications ? (
            <div className="p-8 text-center text-gray-500">
              Loading results...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No delivery results yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Recipient
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Sent At
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Error
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {notifications.map(
                    (notification, index) => (
                      <tr
                        key={
                          notification._id || index
                        }
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-6 py-4 text-gray-700">
                          {notification.email ||
                            notification.recipientEmail ||
                            "—"}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={
                              notification.status
                            }
                          />
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {notification.sentAt
                            ? new Date(
                                notification.sentAt
                              ).toLocaleString()
                            : "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-red-600">
                          {notification.error ||
                            "—"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}