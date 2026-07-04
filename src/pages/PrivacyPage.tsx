import { Link } from "react-router-dom";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F4] px-6 py-12 text-[#2C1810]">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-[#9B7B72] underline">
          Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
        <div className="prose prose-sm mt-6 max-w-none text-[#2C1810]">
          <p>
            We respect your privacy. This policy explains what we collect and how
            we use it when you use Bebio — a parenting journal and activity
            organizer for families.
          </p>
          <h2>Account data</h2>
          <p>
            We store your email, baby profile, and activity logs to provide the
            service. Authentication is handled by Firebase.
          </p>
          <h2>Payments</h2>
          <p>
            Subscription payments are processed by Paddle. We receive subscription
            status from Paddle webhooks but do not store your full card details.
          </p>
          <h2>AI features</h2>
          <p>
            Optional AI tips may use your baby&apos;s logged activities and age to
            personalize responses. Do not enter information you do not want
            processed by our AI provider. AI output is not professional advice.
          </p>
        </div>
      </div>
    </div>
  );
}
