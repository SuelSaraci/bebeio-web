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
            Bebio is a mobile parenting journal and baby activity organizer
            operated by CinzoTech L.L.C. By using our website or mobile app, you
            agree to these terms.
          </p>
          <h2>What Bebio provides</h2>
          <p>
            Bebio is software that helps parents and caregivers log daily baby
            activities (such as feeding, sleep, and diapers), view trends, and
            optionally receive general AI parenting tips. Bebio is not a medical
            service, healthcare provider, or telehealth platform.
          </p>
          <h2>Subscriptions</h2>
          <p>
            Bebio Plus is sold through our website via Paddle. Subscriptions
            renew automatically until canceled. Plus access is tied to your
            account and works in the mobile app after you sign in.
          </p>
          <h2>Important notice</h2>
          <p>
            Content in Bebio — including AI responses — is for general
            informational and organizational purposes only. It is not professional
            advice. For questions about your child&apos;s wellbeing, consult a
            qualified professional.
          </p>
          <h2>Contact</h2>
          <p>
            For support, visit{" "}
            <Link to="/contact" className="underline">
              bebeio.com/contact
            </Link>{" "}
            or email contact@cinzotech.com.
          </p>
        </div>
      </div>
    </div>
  );
}
