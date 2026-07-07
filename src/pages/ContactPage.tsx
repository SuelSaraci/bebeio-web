import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const CONTACT_EMAIL = "contact@cinzotech.com";
const CONTACT_SUBJECT = "Bebio support request";
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`;

function openContactEmail() {
  window.location.href = MAILTO;
}

export function ContactPage() {
  useEffect(() => {
    openContactEmail();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F4] px-6 py-12 text-[#2C1810]">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-[#9B7B72] underline">
          Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Contact</h1>
        <div className="mt-6 max-w-none text-[#2C1810]">
          <p className="text-base leading-relaxed">
            Need help with Bebio, your account, or a subscription? Send us an
            email and we&apos;ll get back to you as soon as we can.
          </p>
          <p className="mt-4 text-sm text-[#9B7B72]">
            Your email app should open automatically. If it doesn&apos;t, use the
            button below.
          </p>
          <button
            type="button"
            onClick={openContactEmail}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#D95C74] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c84f66]"
          >
            <Mail size={16} />
            Email {CONTACT_EMAIL}
          </button>
          <p className="mt-4 text-sm text-[#9B7B72]">
            Subject: {CONTACT_SUBJECT}
          </p>
        </div>
      </div>
    </div>
  );
}
