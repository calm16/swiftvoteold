import { useState } from "react";
import EventsApp from "./EventsApp.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function App() {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const token = window.localStorage.getItem("sv_token") || undefined;

  return (
    <EventsApp
      apiBaseUrl={API_BASE_URL}
      token={token}
      selectedEventId={selectedEventId}
      onSelectEvent={setSelectedEventId}
    />
  );
}
