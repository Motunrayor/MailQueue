import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../services/authService";
import DashboardLayout from "../components/DashboardLayout";

export default function Profile() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCurrentUser();

        setProfile(response.user);
      } catch (error) {
        console.error("Failed to load profile:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const fullName = `${profile?.firstname || ""} ${
    profile?.lastname || ""
  }`.trim();

  const initials =
    `${profile?.firstname?.charAt(0) || ""}${
      profile?.lastname?.charAt(0) || ""
    }`.toUpperCase() || "U";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="animate-pulse">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-gray-200 rounded-full" />

                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-40" />
                    <div className="h-4 bg-gray-200 rounded w-56" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
                  <div className="h-20 bg-gray-100 rounded-xl" />
                  <div className="h-20 bg-gray-100 rounded-xl" />
                  <div className="h-20 bg-gray-100 rounded-xl" />
                  <div className="h-20 bg-gray-100 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-2xl">
                !
              </div>

              <h2 className="text-xl font-bold text-gray-800 mt-5">
                Unable to load profile
              </h2>

              <p className="text-gray-500 mt-2">
                {error}
              </p>

              <button
                onClick={logout}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Page Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              My Profile
            </h1>

            <p className="text-gray-500 mt-1">
              Manage and view your account information.
            </p>
          </div>

          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-500 h-28" />

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md">
                  <div className="w-full h-full rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl font-bold">
                    {initials}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 sm:pb-1">
                  <h2 className="text-xl font-bold text-gray-800">
                    {fullName || "User"}
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    {profile?.email || "No email available"}
                  </p>
                </div>

                {/* Role */}
                <div className="sm:pb-1">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold capitalize">
                    {profile?.role || "User"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Personal Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your basic account information.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* First Name */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  First Name
                </p>

                <p className="mt-2 font-semibold text-gray-800">
                  {profile?.firstname || "N/A"}
                </p>
              </div>

              {/* Last Name */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Last Name
                </p>

                <p className="mt-2 font-semibold text-gray-800">
                  {profile?.lastname || "N/A"}
                </p>
              </div>

              {/* Email */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Email Address
                </p>

                <p className="mt-2 font-semibold text-gray-800 break-all">
                  {profile?.email || "N/A"}
                </p>
              </div>

              {/* Account Type */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Account Type
                </p>

                <p className="mt-2 font-semibold text-gray-800 capitalize">
                  {profile?.account_type || "N/A"}
                </p>
              </div>

              {/* Role */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Role
                </p>

                <p className="mt-2 font-semibold text-gray-800 capitalize">
                  {profile?.role || "User"}
                </p>
              </div>

              {/* Phone */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Phone Number
                </p>

                <p className="mt-2 font-semibold text-gray-800">
                  {profile?.phone_no || "N/A"}
                </p>
              </div>

              {/* State */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  State
                </p>

                <p className="mt-2 font-semibold text-gray-800">
                  {profile?.state || "N/A"}
                </p>
              </div>

              {/* Country */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Country
                </p>

                <p className="mt-2 font-semibold text-gray-800">
                  {profile?.country || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Account Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Information about your MailQueue account.
              </p>
            </div>

            <div className="p-6 space-y-4">

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
                <div>
                  <p className="font-medium text-gray-800">
                    Account Status
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Your MailQueue account is active.
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  Active
                </span>
              </div>

              {profile?.company_name && (
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Company
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {profile.company_name}
                    </p>
                  </div>
                </div>
              )}

              {profile?.brand && (
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Brand
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      {profile.brand}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm">
            <div className="px-6 py-5 border-b border-red-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Account Actions
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Manage your current session.
              </p>
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800">
                  Sign out of MailQueue
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  You will need to log in again to access your account.
                </p>
              </div>

              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 text-sm py-2.5 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}