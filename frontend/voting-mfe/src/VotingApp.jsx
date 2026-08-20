import "./styles.css";

import { useEffect, useState, useCallback, useRef } from "react";

function statusPillClass(status) {
  if (status === "PAID") return "bg-emerald-50 text-emerald-700";
  if (status === "FAILED") return "bg-accent/10 text-accent";
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
  if (response.status === 404) return null;
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

function VoteModal({ apiBaseUrl, token, eventId, contestants, onClose, onVoteRecorded }) {
  const [contestantId, setContestantId] = useState(contestants[0]?.id ?? "");
  const [voterEmail, setVoterEmail] = useState("");
  const [amountMinor, setAmountMinor] = useState("100");
  const [step, setStep] = useState("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [vote, setVote] = useState(null);
  const [payment, setPayment] = useState(null);
  const [notification, setNotification] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const pollTimer = useRef(null);

  useEffect(() => () => pollTimer.current && clearTimeout(pollTimer.current), []);

  async function resolveAfterPaid(finalVote) {
    try {
      const paymentRecord = await apiRequest(apiBaseUrl, `/payments/${finalVote.id}`, { token });
      setPayment(paymentRecord);
    } catch {
    }
    try {
      const notifications = await apiRequest(apiBaseUrl, "/notifications", { token });
      const match = Array.isArray(notifications)
        ? notifications.find((entry) => entry.voteId === finalVote.id)
        : null;
      setNotification(match ?? null);
    } catch {
    }
    setStep("resolved");
  }

  function pollVote(voteId, attemptsLeft) {
    pollTimer.current = setTimeout(async () => {
      try {
        const latest = await apiRequest(apiBaseUrl, `/votes/${voteId}`, { token });
        if (!latest) return;
        setVote(latest);
        setPollCount((count) => count + 1);
        if (latest.status !== "PENDING") {
          await resolveAfterPaid(latest);
          return;
        }
        if (attemptsLeft > 1) {
          pollVote(voteId, attemptsLeft - 1);
        } else {
          setStep("resolved");
        }
      } catch (pollError) {
        setErrorMessage(pollError.message || "Unable to check vote status.");
        setStep("error");
      }
    }, 2000);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!contestantId || !voterEmail.trim()) {
      setErrorMessage("Choose a contestant and enter a voter email.");
      return;
    }
    setStep("submitting");
    setErrorMessage("");
    try {
      const created = await apiRequest(apiBaseUrl, "/votes", {
        method: "POST",
        token,
        body: {
          eventId,
          contestantId,
          voterEmail: voterEmail.trim(),
          amountMinor: Number.parseInt(amountMinor, 10) || 0,
        },
      });
      setVote(created);
      onVoteRecorded(created);
      setStep("pending");
      pollVote(created.id, 5);
    } catch (submissionError) {
      setErrorMessage(submissionError.message || "Unable to cast vote.");
      setStep("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
    >
      <button type="button" className="absolute inset-0 bg-ink/60 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_40px_100px_-30px_rgba(7,17,31,0.45)]">
        <div className="flex items-center justify-between border-b border-ink/8 bg-canvas px-6 py-5">
          <h3 className="font-display text-lg font-semibold text-ink">Cast a vote</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-ink/40 hover:text-ink">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === "form" || step === "submitting" || step === "error" ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink/74">Contestant</span>
                <select
                  value={contestantId}
                  onChange={(event) => setContestantId(event.target.value)}
                  className="form-input"
                >
                  {contestants.length === 0 ? <option value="">No approved contestants</option> : null}
                  {contestants.map((contestant) => (
                    <option key={contestant.id} value={contestant.id}>
                      {contestant.name} ({contestant.code})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink/74">Voter email</span>
                <input
                  type="email"
                  value={voterEmail}
                  onChange={(event) => setVoterEmail(event.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink/74">Amount (minor units)</span>
                <input
                  type="number"
                  min="0"
                  value={amountMinor}
                  onChange={(event) => setAmountMinor(event.target.value)}
                  className="form-input"
                />
                <span className="text-xs text-ink/40">e.g. 100 = 1.00 NGN. Use 0 to trigger a dummy FAILED payment.</span>
              </label>
              {errorMessage ? <p className="form-error-text">{errorMessage}</p> : null}
              <button type="submit" className="button-primary w-full justify-center" disabled={step === "submitting"}>
                {step === "submitting" ? "Casting…" : "Cast vote"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className={`rounded-full px-4 py-1.5 text-sm font-semibold ${statusPillClass(vote?.status)}`}>
                {vote?.status ?? "PENDING"}
              </div>
              <p className="text-sm text-ink/60">
                {step === "pending"
                  ? `Waiting for the async payment flow to resolve… (poll ${pollCount}/5)`
                  : "Vote resolved."}
              </p>
              <div className="w-full rounded-2xl border border-ink/10 bg-canvas p-4 text-left text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink/55">Vote ID</span>
                  <span className="truncate font-mono text-xs text-ink">{vote?.id}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-ink/55">Status</span>
                  <span className="font-semibold text-ink">{vote?.status}</span>
                </div>
                {payment ? (
                  <>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-ink/55">Payment</span>
                      <span className="font-semibold text-ink">{payment.status}</span>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-ink/40">No payment record yet (404 or not processed).</p>
                )}
                {notification ? (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-ink/55">Notification</span>
                    <span className="font-semibold text-ink">sent to {notification.voterEmail}</span>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-ink/40">No matching notification found yet.</p>
                )}
              </div>
              <button type="button" onClick={onClose} className="button-primary w-full justify-center">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VotingApp({ apiBaseUrl, token, eventId }) {
  const baseUrl = apiBaseUrl || "http://localhost:8080/api";
  const [votes, setVotes] = useState([]);
  const [contestants, setContestants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [voteData, contestantData] = await Promise.all([
        apiRequest(baseUrl, `/votes?eventId=${encodeURIComponent(eventId)}`),
        apiRequest(baseUrl, `/contestants?eventId=${encodeURIComponent(eventId)}`),
      ]);
      setVotes(Array.isArray(voteData) ? voteData : []);
      setContestants(
        Array.isArray(contestantData) ? contestantData.filter((c) => c.status === "APPROVED") : [],
      );
    } catch (loadError) {
      setError(loadError.message || "Unable to load votes.");
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!eventId) {
    return (
      <section className="page-shell py-8">
        <span className="eyebrow">Voting</span>
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
      <span className="eyebrow">Voting</span>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-ink sm:text-5xl">
            Cast and track votes.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/62">
            Votes are recorded PENDING, then flip to PAID/FAILED asynchronously through the
            Kafka&rarr;RabbitMQ chain.
          </p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className="button-primary">
          Cast a vote
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 text-sm font-medium text-accent">
          {error}
        </div>
      ) : null}

      <div className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink">Recent votes</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-ink/50">Loading votes…</p>
        ) : votes.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">No votes cast for this event yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white/80 text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-[0.14em] text-ink/40">
                  <th className="px-4 py-3">Voter</th>
                  <th className="px-4 py-3">Contestant ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote) => (
                  <tr key={vote.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3">{vote.voterEmail}</td>
                    <td className="px-4 py-3 font-mono text-xs">{vote.contestantId}</td>
                    <td className="px-4 py-3">{vote.amountMinor}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(vote.status)}`}>
                        {vote.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen ? (
        <VoteModal
          apiBaseUrl={baseUrl}
          token={token}
          eventId={eventId}
          contestants={contestants}
          onClose={() => setModalOpen(false)}
          onVoteRecorded={(created) => setVotes((current) => [created, ...current])}
        />
      ) : null}
    </section>
  );
}
