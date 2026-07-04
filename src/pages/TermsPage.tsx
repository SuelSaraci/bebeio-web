import { Link } from "react-router-dom";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F4] px-6 py-12 text-[#2C1810]">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-[#9B7B72] underline">
          Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Terms of Service</h1>
        <div className="prose prose-sm mt-6 max-w-none text-[#2C1810]">
          <p>
            Bebio is a mobile baby-tracking application operated by CinzoTech
            L.L.C. By using our website or mobile app, you agree to these
            terms.
          </p>
          <h2>Subscriptions</h2>
          <p>
            Bebio Plus is sold through our website via Paddle. Subscriptions
            renew automatically until canceled. Premium access is tied to your
            account and works in the mobile app after you sign in.
          </p>
          <h2>Medical disclaimer</h2>
          <p>
            Bebio provides general parenting information and is not a substitute
            for professional medical advice. Always consult your pediatrician for
            health concerns.
          </p>
          <h2>Contact</h2>
          <p>For support, contact us through the email listed on bebeio.com.</p>
        </div>
      </div>
    </div>
  );
}
