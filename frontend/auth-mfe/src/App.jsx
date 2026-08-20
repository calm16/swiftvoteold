import AuthApp from "./AuthApp.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function App() {
  return (
    <AuthApp
      apiBaseUrl={API_BASE_URL}
      onAuthenticated={(token, user) => {
        window.localStorage.setItem("sv_token", token);
        window.localStorage.setItem("sv_user", JSON.stringify(user));
        alert(`Signed in as ${user.email ?? user.fullName ?? "user"} (standalone auth-mfe demo).`);
      }}
    />
  );
}
