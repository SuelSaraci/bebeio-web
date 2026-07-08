import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const CONTACT_EMAIL = "contact@cinzotech.com";
const DELETE_SUBJECT = "Delete my Bebio account";
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(DELETE_SUBJECT)}`;

export function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F4] px-6 py-12 text-[#2C1810]">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-[#9B7B72] underline">
          Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Delete your Bebio account</h1>
        <div className="prose prose-sm mt-6 max-w-none text-[#2C1810]">
          <p>
            You can request deletion of your <strong>Bebio</strong> account and
            associated data at any time. This applies to the Bebio mobile app and
            website operated by Cinzotech LLC.
          </p>

          <h2>How to request deletion</h2>
          <ol>
            <li>
              Email us from the address linked to your Bebio account at{" "}
              <a href={MAILTO} className="underline">
                {CONTACT_EMAIL}
              </a>
              .
            </li>
            <li>
              Use the subject line: <strong>{DELETE_SUBJECT}</strong>.
            </li>
            <li>
              We will confirm your request and delete your account within 30
              days.
            </li>
          </ol>

          <h2>What we delete</h2>
          <ul>
            <li>Your account (email and profile)</li>
            <li>Baby profile and all activity logs (feeding, sleep, diapers, growth)</li>
            <li>Health records (vaccinations, appointments, medical notes, milestones)</li>
            <li>Push notification tokens</li>
            <li>Subscription status stored on our servers</li>
          </ul>

          <h2>What we may keep</h2>
          <ul>
            <li>
              Billing records held by Paddle (our payment provider) as required
              for tax, fraud prevention, and legal compliance
            </li>
            <li>
              Minimal server logs retained for a short period for security and
              debugging, then deleted automatically
            </li>
          </ul>

          <h2>Cancel subscription first</h2>
          <p>
            If you have an active Bebio Plus subscription, cancel it on our
            website before requesting account deletion to avoid future charges.
          </p>
        </div>

        <a
          href={MAILTO}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#D95C74] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c84f66]"
        >
          <Mail size={16} />
          Request account deletion
        </a>
      </div>
    </div>
  );
}
