import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import ContactForm from "./ContactForm";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../services/contactService";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 10;

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getContacts({ search, page, limit });
      setContacts(data.contacts || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load contacts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, page]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;

    try {
      await deleteContact(id);
      fetchContacts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete contact."
      );
    }
  };

  const handleFormSubmit = async (contactData) => {
    setFormLoading(true);

    try {
      if (editingContact) {
        await updateContact(editingContact._id, contactData);
      } else {
        await createContact(contactData);
      }

      setShowForm(false);
      setEditingContact(null);
      await fetchContacts();
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Contacts
            </h1>

            <p className="text-gray-500 mt-1">
              Manage your email contacts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingContact(null);
              setShowForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium"
          >
            + Add Contact
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <ContactForm
              contact={editingContact}
              onSubmit={handleFormSubmit}
              loading={formLoading}
              onCancel={() => {
                setShowForm(false);
                setEditingContact(null);
              }}
            />
          </div>
        )}

        {/* Contacts table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No contacts found.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-3 text-green-600 hover:text-green-700 font-medium"
              >
                Add your first contact
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold border-r-1 w-8 border-gray-200 text-gray-600">
                      #
                    </th>

                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                      Name
                    </th>

                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                      Email
                    </th>

                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {contacts.map((contact, index) => (
                    <tr
                      key={contact._id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-6 py-3.5 text-sm border-r-1 w-8 border-gray-200 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-3.5 text-sm font-medium text-gray-700">
                        {contact.full_name}
                      </td>

                      <td className="px-6 py-3.5  text-sm text-gray-600">
                        {contact.email}
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingContact(contact);
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded-lg"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(contact._id)
                            }
                            className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-3 py-1 rounded-lg   "
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
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
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
