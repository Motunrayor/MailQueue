
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  requestPasswordReset,
  resetPassword,
} from "../services/authService";

export default function ForgotPassword() {
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: "request", label: "Request code", number: 1 },
    { id: "reset", label: "Reset password", number: 2 },
    { id: "complete", label: "Complete", number: 3 },
  ];

  const currentStep = steps.findIndex((item) => item.id === step);

  const clearFeedback = () => {
    setError("");
    setMessage("");
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    clearFeedback();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter the email address associated with your account.");
      return;
    }

    try {
      setLoading(true);

      const response = await requestPasswordReset(normalizedEmail);

      setEmail(normalizedEmail);
      setMessage(
        response.message || "If the account exists, a reset code has been sent."
      );
      setStep("reset");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to send a reset code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (!/^\d{6}$/.test(otpCode)) {
      setError("Enter the 6-digit reset code from your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        email,
        otp_code: otpCode,
        newPassword,
        confirmPassword,
      });

      setMessage(response.message || "Your password has been reset.");
      setStep("complete");
    } catch (resetError) {
      setError(
        resetError.response?.data?.message ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    clearFeedback();

    try {
      setLoading(true);

      const response = await requestPasswordReset(email);

      setMessage(
        response.message || "If the account exists, a new reset code has been sent."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to resend the reset code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    clearFeedback();
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("request");
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition duration-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-6 sm:px-6 sm:py-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-green-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -right-28 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

      <div className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-900/5 md:min-h-[620px] md:grid-cols-2">
        {/* Desktop Branding Panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-9 text-white md:flex lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full border-[45px] border-white/10" />

          <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15">
              <span className="text-2xl font-bold">M</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">
              MailQueue
            </span>
          </Link>

          <div className="relative z-10 my-10">
            <div className="mb-6 h-1 w-14 rounded-full bg-green-200" />

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-9 w-9"
                aria-hidden="true"
              >
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v3" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold leading-tight lg:text-4xl">
              Secure your
              <br />
              account access.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-green-50 lg:text-base">
              Forgot your password? No worries. Follow a few simple steps to
              securely regain access to your MailQueue account.
            </p>

            <div className="mt-9 space-y-5">
              {[
                "Request a one-time reset code",
                "Verify your email with the code",
                "Create a new password",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-green-50">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-green-100/80">
            © {new Date().getFullYear()} MailQueue. All rights reserved.
          </p>
        </aside>

        {/* Form Panel */}
        <section className="flex items-center justify-center px-5 py-8 sm:px-9 sm:py-10 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Branding */}
            <div className="mb-8 flex items-center justify-between md:hidden">
              <Link to="/" className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white">
                  M
                </span>
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  MailQueue
                </span>
              </Link>

              <Link
                to="/login"
                className="text-sm font-semibold text-green-700 hover:text-green-800"
              >
                Sign in
              </Link>
            </div>

            {/* Progress Indicator */}
            <div className="mb-9">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
                  Account recovery
                </span>
                <span className="text-xs font-medium text-gray-400">
                  Step {currentStep + 1} of 3
                </span>
              </div>

              <div className="mb-4 flex items-center gap-2">
                {steps.map((item, index) => (
                  <div
                    key={item.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      index <= currentStep ? "bg-green-600" : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-1">
                {steps.map((item, index) => (
                  <div
                    key={item.id}
                    className={`text-[10px] font-medium sm:text-xs ${
                      index === currentStep
                        ? "text-green-700"
                        : index < currentStep
                          ? "text-gray-600"
                          : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  step === "complete"
                    ? "bg-green-100 text-green-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {step === "complete" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                ) : step === "reset" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <path d="M12 14v3" />
                  </svg>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                {step === "request" && "Forgot your password?"}
                {step === "reset" && "Check your email"}
                {step === "complete" && "You're all set!"}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
                {step === "request" &&
                  "Enter your account email and we'll send you a secure, one-time reset code."}
                {step === "reset" && (
                  <>
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold text-gray-700 break-all">
                      {email}
                    </span>
                    , then choose a new password.
                  </>
                )}
                {step === "complete" &&
                  "Your password has been changed successfully. You can now sign in with your new password."}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                  !
                </span>
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm text-green-800"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold">
                  ✓
                </span>
                <p>{message}</p>
              </div>
            )}

            {/* Step 1: Request Code */}
            {step === "request" && (
              <form onSubmit={handleRequestCode} className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className={labelClass}>
                    Email address
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
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className={`${inputClass} pl-12`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send reset code
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Reset Password */}
            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label htmlFor="reset-code" className={labelClass}>
                    6-digit verification code
                  </label>

                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(event) =>
                      setOtpCode(
                        event.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    className={`${inputClass} text-center text-xl font-semibold tracking-[0.5em]`}
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Enter the code sent to your email address.
                  </p>
                </div>

                <div>
                  <label htmlFor="new-password" className={labelClass}>
                    New password
                  </label>

                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      placeholder="At least 8 characters"
                      className={`${inputClass} pr-16`}
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
                </div>

                <div>
                  <label htmlFor="confirm-password" className={labelClass}>
                    Confirm new password
                  </label>

                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Enter your password again"
                      className={`${inputClass} pr-16`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      aria-pressed={showConfirmPassword}
                      className="absolute inset-y-0 right-4 text-sm font-semibold text-gray-500 transition hover:text-green-700"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      Reset password
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center justify-between gap-3 pt-1 text-sm sm:flex-row">
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    disabled={loading}
                    className="font-medium text-gray-500 transition hover:text-gray-800 disabled:opacity-50"
                  >
                    ← Change email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="font-semibold text-green-700 transition hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Please wait..." : "Resend code"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Complete */}
            {step === "complete" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">
                        Password updated
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-green-800">
                        Your account is ready to use with your new password.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
                >
                  Back to sign in
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}

            {/* Footer */}
            {step !== "complete" && (
              <p className="mt-8 text-center text-sm text-gray-500">
                Remembered your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-green-700 transition  hover:text-green-800 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            )}

            <p className="mt-8 text-center text-xs text-gray-400 md:hidden">
              © {new Date().getFullYear()} MailQueue. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}