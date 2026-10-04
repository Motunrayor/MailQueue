import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatusBadge from "../components/StatusBadge";
import { getContacts } from "../services/contactService";
import { getCampaigns } from "../services/campaignService";

export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [contactError, setContactError] = useState("");
  const [campaignError, setCampaignError] = useState("");

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true);
        setContactError("");

        const data = await getContacts();

        setContacts(data.contacts || []);
      } catch (error) {
        setContactError(
          error.response?.data?.message ||
            "Unable to load contacts."
        );
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, []);

  useEffect(() => {
    let isActive = true;
    let refreshTimeout;

    const loadCampaigns = async () => {
      try {
        const data = await getCampaigns();

        if (isActive) {
          setCampaigns(data.data || []);
          setCampaignError("");
        }
      } catch (error) {
        if (isActive) {
          setCampaignError(
            error.response?.data?.message ||
              "Unable to load campaigns."
          );
        }
      } finally {
        if (isActive) {
          setLoadingCampaigns(false);
          refreshTimeout = setTimeout(loadCampaigns, 5000);
        }
      }
    };

    loadCampaigns();

    return () => {
      isActive = false;
      clearTimeout(refreshTimeout);
    };
  }, []);

  const recentContacts = contacts.slice(0, 5);
  const emailsSent = campaigns.reduce(
    (total, campaign) => total + (campaign.successCount || 0),
    0
  );
  const failedEmails = campaigns.reduce(
    (total, campaign) => total + (campaign.failedCount || 0),
    0
  );
  const recentCampaigns = [...campaigns]
    .sort(
      (first, second) =>
        new Date(second.createdAt || 0) -
        new Date(first.createdAt || 0)
    )
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1 mb-4">
            Welcome back to MailQueue.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Contacts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Contacts
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                  {loadingContacts ? "..." : contacts.length}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>

            <Link
              to="/dashboard/contacts"
              className="inline-block mt-4 text-sm font-medium text-green-600 hover:text-green-700"
            >
              Manage contacts →
            </Link>
          </div>

          {/* Campaigns */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Campaigns
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {loadingCampaigns ? "..." : campaigns.length}
            </h2>

            <Link
              to="/dashboard/campaigns"
              className="inline-block mt-4 text-sm font-medium text-green-600 hover:text-green-700"
            >
              Manage campaigns →
            </Link>
          </div>

          {/* Emails Sent */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Emails Sent
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {loadingCampaigns
                ? "..."
                : campaignError
                  ? "—"
                  : emailsSent}
            </h2>
          </div>

          {/* Failed Emails */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">
              Failed Emails
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {loadingCampaigns
                ? "..."
                : campaignError
                  ? "—"
                  : failedEmails}
            </h2>
          </div>
        </div>

              {/* Recent Contacts */}
               <div className="flex items-center justify-between px-6 py-5 mt-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Contacts
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Some of your recently added contacts
              </p>
            </div>

            <Link
              to="/dashboard/contacts"
              className="text-sm font-medium text-amber-600 hover:text-amber-600  hover:bg-amber-100 cursor-pointer px-4 py-2 rounded-lg"
            >
              View all →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm mt-4">
            {contactError ? (
            <div className="p-6 text-red-600">
              {contactError}
            </div>
          ) : loadingContacts ? (
            <div className="p-8 text-center text-gray-500">
              Loading contacts...
            </div>
          ) : recentContacts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">👥</div>

              <h3 className="font-semibold text-gray-800">
                No contacts yet
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Add your first contact to get started.
              </p>

              <Link
                to="/dashboard/contacts"
                className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Add Contact
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50/80">
              {recentContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="px-4 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex justify-start items-center gap-3">
                    <div className="w-8 h-7.5 rounded-full p-2 bg-green-100 text-green-700 text-sm flex items-center justify-center font-semibold">
                      {contact.full_name
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                    </div>

                    <div className="flex flex-col justify-center align-baseline">
                      <p className="font-medium text-sm text-gray-800">
                        {contact.full_name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* View more
              <div className="px-6 py-4 text-center">
                <Link
                  to="/dashboard/contacts"
                  className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                >
                  View all contacts →
                </Link>
              </div> */}
            </div>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="flex items-center justify-between px-6 py-5 mt-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Campaigns
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Your most recently created campaigns
            </p>
          </div>

          <Link
            to="/dashboard/campaigns"
            className="text-sm font-medium text-amber-600 hover:bg-amber-100 cursor-pointer px-4 py-2 rounded-lg"
          >
            View all →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm mt-4">
          {campaignError ? (
            <div className="p-6 text-red-600">
              {campaignError}
            </div>
          ) : loadingCampaigns ? (
            <div className="p-8 text-center text-gray-500">
              Loading campaigns...
            </div>
          ) : recentCampaigns.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">✉️</div>

              <h3 className="font-semibold text-gray-800">
                No campaigns yet
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Create your first campaign to get started.
              </p>

              <Link
                to="/dashboard/campaigns/create"
                className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50/80">
              {recentCampaigns.map((campaign) => (
                <Link
                  key={campaign._id}
                  to={`/dashboard/campaigns/${campaign._id}`}
                  className="px-4 py-4 flex items-center justify-between gap-4 hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {campaign.name}
                    </p>

                    <p className="text-xs text-gray-500 truncate mt-1">
                      {campaign.subject}
                    </p>
                  </div>

                  <StatusBadge status={campaign.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}