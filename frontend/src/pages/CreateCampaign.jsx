import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { getContacts } from "../services/contactService";
import {
  createCampaign,
  getCampaignById,
  updateCampaign,
} from "../services/campaignService";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingCampaign, setLoadingCampaign] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
    recipients: [],
  });

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true);

        const data = await getContacts();

        setContacts(data.contacts || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load contacts."
        );
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, []);

  // Load campaign when editing
  useEffect(() => {
    if (!isEditing) return;

    const loadCampaign = async () => {
      try {
        setLoadingCampaign(true);
        setError("");

        const data = await getCampaignById(id);
        const campaign = data.data;

        if (!campaign) {
          setError("Campaign not found.");
          return;
        }

        if (campaign.status !== "draft") {
          setError(
            "Only draft campaigns can be edited."
          );
          return;
        }

        setFormData({
          name: campaign.name || "",
          subject: campaign.subject || "",
          message: campaign.message || campaign.body || "",
          recipients:
            campaign.recipients?.map((recipient) =>
              typeof recipient === "object"
                ? recipient._id
                : recipient
            ) || [],
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load campaign."
        );
      } finally {
        setLoadingCampaign(false);
      }
    };

    loadCampaign();
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRecipientChange = (contactId) => {
    setFormData((previous) => {
      const alreadySelected =
        previous.recipients.includes(contactId);

      return {
        ...previous,
        recipients: alreadySelected
          ? previous.recipients.filter(
              (id) => id !== contactId
            )
          : [...previous.recipients, contactId],
      };
    });
  };

  const handleSelectAll = () => {
    if (formData.recipients.length === contacts.length) {
      setFormData((previous) => ({
        ...previous,
        recipients: [],
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      recipients: contacts.map((contact) => contact._id),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Campaign name is required.");
      return;
    }

    if (!formData.subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Message is required.");
      return;
    }

    if (formData.recipients.length === 0) {
      setError(
        "Please select at least one recipient."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        recipients: formData.recipients,
      };

      if (isEditing) {
        await updateCampaign(id, payload);
        navigate(`/dashboard/campaigns/${id}`);
      } else {
        const data = await createCampaign(payload);

        const campaignId = data.data?._id;

        if (campaignId) {
          navigate(`/dashboard/campaigns/${campaignId}`);
        } else {
          navigate("/dashboard/campaigns");
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save campaign."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCampaign) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">
          Loading campaign...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing
              ? "Edit Campaign"
              : "Create Campaign"}
          </h1>

          <p className="text-gray-500 mt-1">
            Create a campaign and select the contacts
            who should receive it.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Campaign information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Campaign Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. October Newsletter"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Email subject"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={10}
                  placeholder="Write your email message..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Recipients
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Select the contacts who should receive
                  this campaign.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSelectAll}
                disabled={
                  loadingContacts ||
                  contacts.length === 0
                }
                className="text-sm font-medium text-amber-600 hover:text-amber-700 cursor-pointer disabled:text-gray-400"
              >
                {formData.recipients.length ===
                contacts.length
                  ? "Clear all"
                  : "Select all"}
              </button>
            </div>

            {loadingContacts ? (
              <div className="py-8 text-center text-gray-500">
                Loading contacts...
              </div>
            ) : contacts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  You don't have any contacts yet.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard/contacts")}
                  className="mt-3 text-green-600 font-medium hover:text-green-700"
                >
                  Add contacts first →
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 px-4 py-3 bg-green-50 rounded-lg text-sm text-green-700">
                  {formData.recipients.length} contact
                  {formData.recipients.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </div>

                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {contacts.map((contact) => {
                    const selected =
                      formData.recipients.includes(
                        contact._id
                      );

                    return (
                      <label
                        key={contact._id}
                        className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            handleRecipientChange(
                              contact._id
                            )
                          }
                          className="w-4 h-4 text-green-600 rounded"
                        />

                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                          {contact.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>

                        <div>
                          <p className="font-medium text-gray-800">
                            {contact.full_name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {contact.email}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  isEditing
                      ? `/dashboard/campaigns/${id}`
                      : "/dashboard/campaigns"
                )
              }
              className="px-5 py-2.5 rounded-lg border text-sm border-gray-300 cursor-pointer text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg text-sm bg-amber-600 cursor-pointer hover:bg-amber-700 text-white font-medium disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : isEditing
                ? "Update Campaign"
                : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
