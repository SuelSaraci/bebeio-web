import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { UpgradePage } from "./pages/UpgradePage";
import { TermsPage } from "./pages/TermsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ContactPage } from "./pages/ContactPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/upgrade" element={<UpgradePage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact" element={<ContactPage />} />
    </Routes>
  );
}
