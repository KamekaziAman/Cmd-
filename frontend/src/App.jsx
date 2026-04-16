import { Link, Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";
import HomePage from "./pages/HomePage";
import CommandPage from "./pages/CommandPage";
import CreateCommandPage from "./pages/CreateCommandPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import "./App.css";

export default function App() {
  return (
    <div className="app-shell">
      <main className="site-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/commands/:id" element={<CommandPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            }
          />
          <Route
            path="/create"
            element={
              <RequireAuth>
                <CreateCommandPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
