import "./styles.css";

import { useEffect, useState, useCallback } from "react";

function statusClass(status) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-700";
  if (status === "REJECTED") return "bg-accent/10 text-accent";
  return "bg-primary/8 text-primary";
}

async function apiRequest(apiBaseUrl, path, { method = "GET", token, body } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

function NominationForm({ apiBaseUrl, token, eventId, onCreated }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Contestant name is required.";
    if (!code.trim()) nextErrors.code = "A short code is required (unique within this event).";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) {
      setError("Please correct the highlighted fields.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await apiRequest(apiBaseUrl, "/contestants", {
        method: "POST",
        token,
        body: { eventId, name: name.trim(), code: code.trim(), bio: bio.trim() },
      });
      setName("");
      setCode("");
      setBio("");
      onCreated(created);
    } catch (submissionError) {
      setError(submissionError.message || "Unable to submit nomination.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel space-y-4 p-6">
      <h3 className="font-display text-lg font-semibold text-ink">Nominate a contestant</h3>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-ink/74">Name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={`form-input ${errors.name ? "form-input-invalid" : ""}`}
          placeholder="Full name"
        />
        {errors.name ? <p className="form-error-text">{errors.name}</p> : null}
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-ink/74">Code</span>
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className={`form-input ${errors.code ? "form-input-invalid" : ""}`}
          placeholder="e.g. C001"
        />
        {errors.code ? <p className="form-error-text">{errors.code}</p> : null}
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-ink/74">Bio (optional)</span>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="min-h-[100px] w-full rounded-[1.2rem] border border-ink/10 bg-white/90 px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
          placeholder="A short introduction for this contestant"
        />
      </label>
      {error ? <p className="form-error-text">{error}</p> : null}
      <button type="submit" className="button-primary" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit nomination"}
      </button>
    </form>
  );
}

function ContestantCard({ contestant, apiBaseUrl, token, onUpdated }) {
  const [isWorking, setIsWorking] = useState(false);
  const [actionError, setActionError] = useState(null);

  async function handleAction(action) {
    setIsWorking(true);
    setActionError(null);
    try {
      const updated = await apiRequest(apiBaseUrl, `/contestants/${contestant.id}/${action}`, {
        method: "PATCH",
        token,
      });
      onUpdated(updated);
    } catch (actionErr) {
      setActionError(actionErr.message || "Action failed.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <article className="glass-panel p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">{contestant.name}</h3>
          <span className="mt-1 inline-block rounded-full bg-ink px-2 py-0.5 font-mono text-[0.65rem] font-semibold text-white">
            {contestant.code}
          </span>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(contestant.status)}`}>
          {contestant.status}
        </span>
      </div>
      {contestant.bio ? <p className="mt-3 text-sm leading-6 text-ink/60">{contestant.bio}</p> : null}
      {token && contestant.status === "PENDING" ? (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => handleAction("approve")}
            disabled={isWorking}
            className="button-primary"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => handleAction("reject")}
            disabled={isWorking}
            className="button-secondary"
          >
            Reject
          </button>
        </div>
      ) : null}
      {actionError ? <p className="form-error-text mt-2">{actionError}</p> : null}
    </article>
  );
}

export default function ContestantsApp({ apiBaseUrl, token, eventId }) {
  const baseUrl = apiBaseUrl || "http://localhost:8080/api";
  const [contestants, setContestants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContestants = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(baseUrl, `/contestants?eventId=${encodeURIComponent(eventId)}`);
      setContestants(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load contestants.");
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, eventId]);

  useEffect(() => {
    loadContestants();
  }, [loadContestants]);

  if (!eventId) {
    return (
      <section className="page-shell py-8">
        <span className="eyebrow">Contestants</span>
        <div className="glass-panel mt-6 p-10 text-center">
          <p className="font-display text-2xl font-semibold text-ink">No event selected</p>
          <p className="mt-2 text-sm text-ink/50">
            Select an event in the <span className="font-semibold text-primary">Events</span> tab
            first.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell py-8">
      <span className="eyebrow">Contestants</span>
      <h1 className="mt-5 font-display text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-ink sm:text-5xl">
        Manage nominations.
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-ink/62">
        Contestants nominated for this event, with approval controls for signed-in organisers.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {error ? (
            <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 text-sm font-medium text-accent">
              {error}
            </div>
          ) : null}
          {isLoading ? (
            <p className="text-sm text-ink/50">Loading contestants…</p>
          ) : contestants.length === 0 ? (
            <div className="glass-panel p-10 text-center">
              <p className="font-display text-2xl font-semibold text-ink">No contestants yet</p>
              <p className="mt-2 text-sm text-ink/50">
                {token ? "Nominate the first contestant using the form." : "Sign in to nominate a contestant."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {contestants.map((contestant) => (
                <ContestantCard
                  key={contestant.id}
                  contestant={contestant}
                  apiBaseUrl={baseUrl}
                  token={token}
                  onUpdated={(updated) =>
                    setContestants((current) =>
                      current.map((item) => (item.id === updated.id ? updated : item)),
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div>
          {token ? (
            <NominationForm
              apiBaseUrl={baseUrl}
              token={token}
              eventId={eventId}
              onCreated={(created) => setContestants((current) => [created, ...current])}
            />
          ) : (
            <div className="glass-panel p-6 text-sm text-ink/60">
              Sign in from the <span className="font-semibold text-primary">Auth</span> tab to
              nominate a contestant or moderate nominations.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
