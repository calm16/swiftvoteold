import React, { lazy, Suspense, useEffect, useState } from "react";

const AuthApp = lazy(() => import("authMfe/AuthApp"));
const EventsApp = lazy(() => import("eventsMfe/EventsApp"));
const ContestantsApp = lazy(() => import("contestantsMfe/ContestantsApp"));
const VotingApp = lazy(() => import("votingMfe/VotingApp"));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const TABS = [
  { key: "auth", label: "Auth" },
  { key: "events", label: "Events" },
  { key: "contestants", label: "Contestants" },
  { key: "voting", label: "Voting" },
];

function LoadingState({ label }) {
  return (
    <div className="page-shell py-16 text-center text-sm text-ink/50">
      Loading {label}…
    </div>
  );
}

function RemoteErrorBoundaryFallback({ label }) {
  return (
    <div className="page-shell py-16">
      <div className="glass-panel mx-auto max-w-lg p-8 text-center">
        <p className="font-display text-xl font-semibold text-ink">Couldn&apos;t load {label}</p>
        <p className="mt-2 text-sm text-ink/55">
          The {label} micro-frontend isn&apos;t reachable right now. Make sure its dev server /
          container is running on its own port and rebuild the shell if remote URLs changed.
        </p>
      </div>
    </div>
  );
}

class Boundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return <RemoteErrorBoundaryFallback label={this.props.label} />;
    }
    return this.props.children;
  }
}

export default function App() {
  const [token, setToken] = useState(() => window.localStorage.getItem("sv_token") || null);
  const [user, setUser] = useState(() => {
    const raw = window.localStorage.getItem("sv_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [selectedEventId, setSelectedEventId] = useState(
    () => window.localStorage.getItem("sv_selected_event") || null,
  );
  const [activeTab, setActiveTab] = useState(token ? "events" : "auth");

  useEffect(() => {
    if (token) window.localStorage.setItem("sv_token", token);
    else window.localStorage.removeItem("sv_token");
  }, [token]);

  useEffect(() => {
    if (user) window.localStorage.setItem("sv_user", JSON.stringify(user));
    else window.localStorage.removeItem("sv_user");
  }, [user]);

  useEffect(() => {
    if (selectedEventId) window.localStorage.setItem("sv_selected_event", selectedEventId);
    else window.localStorage.removeItem("sv_selected_event");
  }, [selectedEventId]);

  function handleAuthenticated(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    setActiveTab("events");
  }

  function handleSignOut() {
    setToken(null);
    setUser(null);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/8 bg-white/70 backdrop-blur">
        <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="font-display text-2xl font-semibold tracking-[-0.04em] text-ink">
              SwiftVotes
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-ink/40">Micro-frontend shell</p>
          </div>

          <nav className="flex flex-wrap gap-2 rounded-full border border-ink/10 bg-white/70 p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-soft"
                    : "text-ink/60 hover:bg-primary/8 hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-ink/60">
                  Signed in as <span className="font-semibold text-ink">{user.email ?? user.fullName}</span>
                </span>
                <button type="button" onClick={handleSignOut} className="button-secondary">
                  Sign out
                </button>
              </>
            ) : (
              <span className="text-sm text-ink/50">Use the Auth tab to sign in</span>
            )}
          </div>
        </div>
      </header>

      <main>
        {activeTab === "auth" ? (
          <Boundary label="Auth">
            <Suspense fallback={<LoadingState label="Auth" />}>
              <AuthApp apiBaseUrl={API_BASE_URL} onAuthenticated={handleAuthenticated} />
            </Suspense>
          </Boundary>
        ) : null}

        {activeTab === "events" ? (
          <Boundary label="Events">
            <Suspense fallback={<LoadingState label="Events" />}>
              <EventsApp
                apiBaseUrl={API_BASE_URL}
                token={token}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
              />
            </Suspense>
          </Boundary>
        ) : null}

        {activeTab === "contestants" ? (
          <Boundary label="Contestants">
            <Suspense fallback={<LoadingState label="Contestants" />}>
              <ContestantsApp apiBaseUrl={API_BASE_URL} token={token} eventId={selectedEventId} />
            </Suspense>
          </Boundary>
        ) : null}

        {activeTab === "voting" ? (
          <Boundary label="Voting">
            <Suspense fallback={<LoadingState label="Voting" />}>
              <VotingApp apiBaseUrl={API_BASE_URL} token={token} eventId={selectedEventId} />
            </Suspense>
          </Boundary>
        ) : null}
      </main>
    </div>
  );
}
