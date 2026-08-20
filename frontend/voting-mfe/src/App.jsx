import { useState } from "react";
import VotingApp from "./VotingApp.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function App() {
  const [eventId, setEventId] = useState(
    () => new URLSearchParams(window.location.search).get("eventId") || "",
  );
  const token = window.localStorage.getItem("sv_token") || undefined;

  return (
    <div>
      <div className="page-shell pt-6">
        <label className="block max-w-md space-y-2">
          <span className="text-sm font-semibold text-ink/74">
            Event ID (standalone demo — the shell passes this automatically)
          </span>
          <input
            type="text"
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="form-input"
            placeholder="Paste an event UUID"
          />
        </label>
      </div>
      <VotingApp apiBaseUrl={API_BASE_URL} token={token} eventId={eventId || undefined} />
    </div>
  );
}
