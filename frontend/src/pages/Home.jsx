import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    number: "01",
    title: "Keep your contacts close",
    description:
      "Build and maintain an organized contact list, ready whenever you have a message to share.",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8" />
      </>
    ),
  },
  {
    number: "02",
    title: "Make every campaign count",
    description:
      "Write a message, choose its recipients, and save your campaign as a draft before it goes out.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
  },
  {
    number: "03",
    title: "Follow delivery progress",
    description:
      "See campaign status and recipient-level delivery results from one straightforward workspace.",
    icon: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 4-4 3 2 6-7" />
        <path d="M16 6h4v4" />
      </>
    ),
  },
];

const steps = [
  ["Gather", "Add the people you want to reach."],
  ["Compose", "Create a campaign and select recipients."],
  ["Track", "Check status and review delivery results."],
];

function Brand({ light = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-lg font-bold text-white shadow-lg shadow-green-950/15">
        M
      </span>
      <span
        className={`text-xl font-bold tracking-tight ${
          light ? "text-white" : "text-gray-950"
        }`}
      >
        MailQueue
      </span>
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M4 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const primaryLink = isAuthenticated ? "/dashboard" : "/register";
  const primaryLabel = isAuthenticated ? "Go to dashboard" : "Get started";

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcfa] text-gray-900">
      <header className="relative z-10 border-b border-gray-200/70 bg-white/85 backdrop-blur">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8"
        >
          <Brand />

          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href="#features"
              className="hidden text-sm font-medium text-gray-600 transition hover:text-green-700 sm:inline"
            >
              Features
            </a>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 transition hover:text-green-700"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_35%,rgba(187,247,208,0.45),transparent_38%),radial-gradient(ellipse_at_15%_10%,rgba(220,252,231,0.55),transparent_32%)]"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:py-28">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-green-800 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                A clearer way to manage email campaigns
              </div>

              <h1 className="text-5xl font-semibold leading-[1.06] tracking-[-0.055em] text-gray-950 sm:text-6xl lg:text-[4.4rem]">
                Your next great
                <span className="relative mx-2 inline-block whitespace-nowrap text-green-700">
                  send
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 180 12"
                    className="absolute -bottom-1 left-0 w-full text-green-300"
                    fill="none"
                  >
                    <path
                      d="M3 8C45 2 118 1 177 6"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                starts here.
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-gray-600">
                MailQueue brings your contacts, campaigns, and delivery
                progress into one simple workspace, so you can spend less time
                juggling tools and more time on your message.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={primaryLink}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-green-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/15 transition hover:-translate-y-0.5 hover:bg-green-800"
                >
                  {primaryLabel}
                  <ArrowIcon />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                  >
                    I already have an account
                  </Link>
                )}
              </div>

              <div className="mt-9 flex items-center gap-3 text-sm text-gray-500">
                <div className="flex -space-x-2" aria-hidden="true">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#fbfcfa] bg-green-100 text-xs font-bold text-green-800">
                    C
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#fbfcfa] bg-amber-100 text-xs font-bold text-amber-800">
                    M
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#fbfcfa] bg-sky-100 text-xs font-bold text-sky-800">
                    A
                  </span>
                </div>
                <span>Contacts to campaign, all in one place.</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div
                aria-hidden="true"
                className="absolute -inset-5 rounded-[2.5rem] bg-green-200/40 blur-2xl"
              />

              <div className="relative overflow-hidden rounded-[1.7rem] border border-gray-200 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.32)]">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    MAILQUEUE / OVERVIEW
                  </span>
                  <span className="h-7 w-7 rounded-full bg-green-100 text-center text-xs font-bold leading-7 text-green-800">
                    M
                  </span>
                </div>

                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[145px_1fr]">
                  <aside className="border-r border-gray-100 bg-gray-50/70 p-3 sm:p-4">
                    <div className="mb-7 flex items-center gap-2 px-1">
                      <span className="h-6 w-6 rounded-md bg-green-700 text-center text-xs font-bold leading-6 text-white">
                        M
                      </span>
                      <span className="hidden text-xs font-bold text-gray-700 sm:inline">
                        MailQueue
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px] font-medium">
                      <div className="rounded-lg bg-green-100 px-2 py-2 text-green-800 sm:px-3">
                        ▦ <span className="ml-1">Overview</span>
                      </div>
                      <div className="px-2 py-2 text-gray-500 sm:px-3">
                        ◉ <span className="ml-1">Contacts</span>
                      </div>
                      <div className="px-2 py-2 text-gray-500 sm:px-3">
                        ✉ <span className="ml-1">Campaigns</span>
                      </div>
                    </div>
                    <div className="mt-10 rounded-xl bg-white p-3 shadow-sm">
                      <div className="mb-2 h-2 w-12 rounded bg-gray-200" />
                      <div className="h-2 w-full rounded bg-gray-100" />
                      <div className="mt-1.5 h-2 w-2/3 rounded bg-gray-100" />
                    </div>
                  </aside>

                  <div className="min-w-0 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                          Workspace
                        </p>
                        <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
                          Good morning
                        </h2>
                      </div>
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                        All systems ready
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-gray-100 p-3 sm:p-4">
                        <p className="text-[10px] text-gray-500 sm:text-xs">
                          Contacts
                        </p>
                        <div className="mt-2 flex items-end justify-between">
                          <span className="text-xl font-semibold text-gray-900 sm:text-2xl">
                            1,248
                          </span>
                          <span className="text-[10px] font-semibold text-green-700">
                            +12%
                          </span>
                        </div>
                        <div className="mt-3 h-1.5 rounded-full bg-gray-100">
                          <div className="h-1.5 w-3/4 rounded-full bg-green-500" />
                        </div>
                      </div>
                      <div className="rounded-xl border border-gray-100 p-3 sm:p-4">
                        <p className="text-[10px] text-gray-500 sm:text-xs">
                          Campaigns
                        </p>
                        <div className="mt-2 flex items-end justify-between">
                          <span className="text-xl font-semibold text-gray-900 sm:text-2xl">
                            08
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            this month
                          </span>
                        </div>
                        <div className="mt-3 flex h-1.5 gap-1">
                          <span className="w-1/2 rounded-full bg-green-500" />
                          <span className="w-1/3 rounded-full bg-amber-300" />
                          <span className="flex-1 rounded-full bg-gray-100" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-100 p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-800 sm:text-sm">
                            Recent campaigns
                          </h3>
                          <p className="mt-1 text-[10px] text-gray-400">
                            A quick look at your activity
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-green-700">
                          View all →
                        </span>
                      </div>

                      <div className="mt-3 divide-y divide-gray-100">
                        <div className="flex items-center justify-between gap-2 py-2.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-50 text-xs text-green-700">
                              ✉
                            </span>
                            <span className="truncate text-[10px] font-medium text-gray-700 sm:text-xs">
                              Product update
                            </span>
                          </div>
                          <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[9px] font-semibold text-green-700">
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 py-2.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-xs text-amber-700">
                              ✉
                            </span>
                            <span className="truncate text-[10px] font-medium text-gray-700 sm:text-xs">
                              October newsletter
                            </span>
                          </div>
                          <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">
                            Queued
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-lg text-green-800">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Progress at a glance
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Campaign status in one place
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-gray-200/80 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                One calmer workflow
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                Everything you need to move from contact to campaign.
              </h2>
              <p className="mt-4 leading-7 text-gray-600">
                Keep the essentials together and know where each campaign
                stands, without adding clutter to your process.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="group rounded-2xl border border-gray-200 bg-[#fcfdfb] p-6 transition hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-950/5 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-800 transition group-hover:bg-green-700 group-hover:text-white">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        {feature.icon}
                      </svg>
                    </span>
                    <span className="text-xs font-semibold tracking-widest text-gray-400">
                      {feature.number}
                    </span>
                  </div>
                  <h3 className="mt-7 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f4f7f2]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                Simple by design
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                A workflow that stays out of your way.
              </h2>
              <p className="mt-4 leading-7 text-gray-600">
                Start with the people you want to reach, shape your campaign,
                and keep an eye on delivery from your dashboard.
              </p>
              <Link
                to={primaryLink}
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-green-800 transition hover:text-green-950"
              >
                {primaryLabel}
                <ArrowIcon />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map(([title, description], index) => (
                <div
                  key={title}
                  className="rounded-2xl border border-green-950/10 bg-white p-5 shadow-sm"
                >
                  <span className="text-xs font-bold tracking-widest text-green-700">
                    STEP 0{index + 1}
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-gray-950 px-7 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-300">
                Make room for better communication
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to bring your campaigns together?
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-300 sm:text-base">
                Set up your workspace and start organizing your next send.
              </p>
            </div>
            <Link
              to={primaryLink}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-green-500 px-6 py-3.5 text-sm font-semibold text-gray-950 transition hover:bg-green-400"
            >
              {primaryLabel}
              <ArrowIcon />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Brand />
          <p className="text-xs text-gray-500">
            Contacts, campaigns, and delivery progress in one workspace.
          </p>
          <div className="flex gap-5 text-sm font-medium text-gray-600">
            <Link to="/login" className="transition hover:text-green-700">
              Log in
            </Link>
            <Link to="/register" className="transition hover:text-green-700">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
