import "./styles.css";

import { useEffect, useState, useCallback } from "react";

function statusClass(status) {
  if (status === "PUBLISHED") return "bg-primary text-white";
  if (status === "CLOSED") return "bg-slate-100 text-slate-600";
  return "bg-primary/8 text-primary";
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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

function EventCard({ event, isSelected, onSelect }) {
  return (
    <article
      onClick={onSelect}
      className={`glass-panel cursor-pointer p-6 transition hover:-translate-y-0.5 ${
        isSelected ? "border-primary/40 shadow-soft" : ""
      }`}
      aria-label={`Event ${event.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold leading-tight text-ink">{event.name}</h3>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(event.status)}`}>
          {event.status}
        </span>
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-ink/40">Voting window</p>
      <p className="mt-1 text-sm text-ink/62">
        {formatDate(event.votingStartAt)} &rarr; {formatDate(event.votingEndAt)}
      </p>
      {event.slug ? <p className="mt-3 text-xs text-ink/35">/{event.slug}</p> : null}
      {isSelected ? (
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Selected</p>
      ) : null}
    </article>
  );
}

function CreateEventForm({ apiBaseUrl, token, onCreated }) {
  const [name, setName] = useState("");
  const [votingStartAt, setVotingStartAt] = useState("");
  const [votingEndAt, setVotingEndAt] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Event name is required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await apiRequest(apiBaseUrl, "/events", {
        method: "POST",
        token,
        body: {
          name: name.trim(),
          votingStartAt: votingStartAt ? new Date(votingStartAt).toISOString() : undefined,
          votingEndAt: votingEndAt ? new Date(votingEndAt).toISOString() : undefined,
        },
      });
      setName("");
      setVotingStartAt("");
      setVotingEndAt("");
      onCreated(created);
    } catch (submissionError) {
      setError(submissionError.message || "Unable to create event.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel space-y-4 p-6">
      <h3 className="font-display text-lg font-semibold text-ink">Create an event</h3>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-ink/74">Event name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="form-input"
          placeholder="Campus Icon Awards 2026"
          required
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink/74">Voting starts</span>
          <input
            type="datetime-local"
            value={votingStartAt}
            onChange={(event) => setVotingStartAt(event.target.value)}
            className="form-input"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink/74">Voting ends</span>
          <input
            type="datetime-local"
            value={votingEndAt}
            onChange={(event) => setVotingEndAt(event.target.value)}
            className="form-input"
          />
        </label>
      </div>
      {error ? <p className="form-error-text">{error}</p> : null}
      <button type="submit" className="button-primary" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create event (draft)"}
      </button>
    </form>
  );
}

export default function EventsApp({ apiBaseUrl, token, selectedEventId, onSelectEvent }) {
  const baseUrl = apiBaseUrl || "http://localhost:8080/api";
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(baseUrl, "/events");
      setEvents(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load events.");
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;

  async function handlePublish() {
    if (!selectedEvent) return;
    setIsPublishing(true);
    setPublishError(null);
    try {
      const updated = await apiRequest(baseUrl, `/events/${selectedEvent.id}/publish`, {
        method: "PATCH",
        token,
      });
      setEvents((current) => current.map((event) => (event.id === updated.id ? updated : event)));
    } catch (publishErr) {
      setPublishError(publishErr.message || "Unable to publish event.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <section className="page-shell py-8">
      <span className="eyebrow">Events</span>
      <h1 className="mt-5 font-display text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-ink sm:text-5xl">
        Browse voting events.
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-ink/62">
        Pick an event to work with contestants and votes for it in the other tabs.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {error ? (
            <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 text-sm font-medium text-accent">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-ink/50">Loading events…</p>
          ) : events.length === 0 ? (
            <div className="glass-panel p-10 text-center">
              <p className="font-display text-2xl font-semibold text-ink">No events yet</p>
              <p className="mt-2 text-sm text-ink/50">
                {token ? "Create the first event using the form." : "Sign in via the Auth tab to create one."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSelected={event.id === selectedEventId}
                  onSelect={() => onSelectEvent?.(event.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {token ? (
            <CreateEventForm
              apiBaseUrl={baseUrl}
              token={token}
              onCreated={(created) => {
                setEvents((current) => [created, ...current]);
                onSelectEvent?.(created.id);
              }}
            />
          ) : (
            <div className="glass-panel p-6 text-sm text-ink/60">
              Sign in from the <span className="font-semibold text-primary">Auth</span> tab to create
              events.
            </div>
          )}

          {selectedEvent ? (
            <div className="glass-panel space-y-3 p-6">
              <h3 className="font-display text-lg font-semibold text-ink">Selected event</h3>
              <p className="text-sm text-ink/70">{selectedEvent.name}</p>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass(selectedEvent.status)}`}>
                {selectedEvent.status}
              </span>
              {token && selectedEvent.status === "DRAFT" ? (
                <div>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="button-primary mt-2 w-full justify-center"
                  >
                    {isPublishing ? "Publishing..." : "Publish event"}
                  </button>
                  {publishError ? <p className="form-error-text mt-2">{publishError}</p> : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
