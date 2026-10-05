
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone_no: "",
    address: "",
    state: "",
    country: "",
    account_type: "individual",
    company_name: "",
    brand: "",
    socialmedia_url: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const requiredFields = [
      "firstname",
      "lastname",
      "email",
      "password",
      "phone_no",
      "address",
      "state",
      "country",
      "account_type",
    ];

    const missingField = requiredFields.find(
      (field) => !String(formData[field] || "").trim()
    );

    if (missingField) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.account_type === "organization") {
      if (
        !formData.company_name.trim() ||
        !formData.socialmedia_url.trim()
      ) {
        setError(
          "Company name and social media URL are required for organization accounts."
        );
        return;
      }
    }

    try {
      setLoading(true);

      await register({
        ...formData,
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        phone_no: formData.phone_no.trim(),
        address: formData.address.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        company_name: formData.company_name.trim(),
        brand: formData.brand.trim(),
        socialmedia_url: formData.socialmedia_url.trim(),
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" grid w-full  grid-cols-1 overflow-hidden  bg-white shadow-xl md:grid-cols-[0.8fr_1.2fr]">

        {/* Branding Panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-10 text-white md:flex lg:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border-[45px] border-white/10" />

            <div className="flex flex-col gap-12">
                <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15">
                <span className="text-2xl font-bold">M</span>
                </div>
                <span className="text-2xl font-bold tracking-tight">
                MailQueue
                </span>
            </Link>

            <div className="relative ">
                <div className="mb-6 h-1 w-14 rounded-full bg-green-200" />

                <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
                Start managing
                <br />
                your emails smarter.
                </h1>

                <p className="mt-5 max-w-sm text-sm leading-relaxed text-green-50 lg:text-base">
                Create your account and bring your contacts, campaigns, and
                email delivery activities together in one place.
                </p>

                <div className="mt-9 space-y-5">
                {[
                    "Organize your contacts",
                    "Create email campaigns",
                    "Track your campaign progress",
                ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm">
                        ✓
                    </span>
                    <span className="text-sm text-green-50">{item}</span>
                    </div>
                ))}
                </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-green-100/80">
            © {new Date().getFullYear()} MailQueue. All rights reserved.
          </p>
        </div>

        {/* Registration Form */}
        <div className="p-5 sm:p-8 lg:p-12">
          <div className="mx-auto max-w-2xl">

            {/* Mobile Brand */}
            <Link to="/" className="mb-8 flex w-fit items-center gap-2 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                <span className="text-xl font-bold text-white">M</span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                MailQueue
              </span>
            </Link>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold tracking-wide text-green-600">
                GET STARTED
              </p>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Fill in your details below to join MailQueue.
                Fields marked with * are required.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span className="font-bold">!</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Personal Details */}
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Personal Information
                    </h3>
                    <p className="text-xs text-gray-500">
                      Tell us a little about yourself.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstname" className={labelClass}>
                      First name *
                    </label>
                    <input
                      id="firstname"
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="First name"
                      autoComplete="given-name"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="lastname" className={labelClass}>
                      Last name *
                    </label>
                    <input
                      id="lastname"
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Last name"
                      autoComplete="family-name"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className={labelClass}>
                      Email address *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="m3 7 9 6 9-6" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className={`${inputClass} pl-12`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="password" className={labelClass}>
                      Password *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <rect x="4" y="10" width="16" height="11" rx="2" />
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                          <path d="M12 14v3" />
                        </svg>
                      </span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        required
                        className={`${inputClass} pl-12 pr-16`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((visible) => !visible)
                        }
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-4 text-sm font-semibold text-gray-500 transition hover:text-green-700"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Use a strong password that you don't use elsewhere.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone_no" className={labelClass}>
                      Phone number *
                    </label>
                    <input
                      id="phone_no"
                      type="tel"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className={labelClass}>
                      Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      autoComplete="street-address"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className={labelClass}>
                      State *
                    </label>
                    <input
                      id="state"
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      autoComplete="address-level1"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className={labelClass}>
                      Country *
                    </label>
                    <input
                      id="country"
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Country"
                      autoComplete="country-name"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Account Type */}
              <section className="border-t border-gray-100 pt-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M3 10h18M9 20V10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Account Type
                    </h3>
                    <p className="text-xs text-gray-500">
                      Choose the account that suits you.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      formData.account_type === "individual"
                        ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="account_type"
                      value="individual"
                      checked={formData.account_type === "individual"}
                      onChange={handleChange}
                      className="mt-1 accent-green-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-800">
                        Individual
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                        For personal email campaigns and contact management.
                      </span>
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      formData.account_type === "organization"
                        ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="account_type"
                      value="organization"
                      checked={formData.account_type === "organization"}
                      onChange={handleChange}
                      className="mt-1 accent-green-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-800">
                        Organization
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                        For businesses and teams managing campaigns.
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              {/* Organization Information */}
              {formData.account_type === "organization" && (
                <section className="space-y-5 rounded-2xl border border-green-100 bg-green-50/50 p-5">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Organization Information
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Provide some details about your organization.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="company_name" className={labelClass}>
                      Company name *
                    </label>
                    <input
                      id="company_name"
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="Your company name"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="brand" className={labelClass}>
                      Brand name
                    </label>
                    <input
                      id="brand"
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Your brand name (optional)"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="socialmedia_url" className={labelClass}>
                      Social media URL *
                    </label>
                    <input
                      id="socialmedia_url"
                      type="url"
                      name="socialmedia_url"
                      value={formData.socialmedia_url}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />
                  </div>
                </section>
              )}

              {/* Submit */}
              <div className="border-t border-gray-100 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                          opacity=".25"
                        />
                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>

                <p className="mt-6 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-green-600 hover:text-green-700 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>

            <p className="mt-8 text-center text-xs text-gray-400">
              By creating an account, you agree to use MailQueue responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}