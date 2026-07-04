import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Baby, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import { AuthModal } from "../components/AuthModal";
import { createSubscriptionCheckout } from "../services/subscriptionsService";
import { initPaddle, openPaddleCheckout } from "../services/paddleService";

type BillingPlan = "monthly" | "yearly";

const plans = {
  monthly: { label: "$5/mo", amount: 5 },
  yearly: { label: "$50/yr", amount: 50, savings: 17 },
};

export function UpgradePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { hasPremium, isLoading, refreshSubscription } = useSubscription();
  const [billingPlan, setBillingPlan] = useState<BillingPlan>("yearly");
  const [authOpen, setAuthOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paddleReady, setPaddleReady] = useState(false);
  const [checkoutAfterAuth, setCheckoutAfterAuth] = useState(false);

  const returnToApp = searchParams.get("returnToApp") === "1";
  const appReturnUrl = searchParams.get("returnUrl")?.trim() || "";

  const redirectBackToApp = () => {
    if (!returnToApp || !appReturnUrl) return;
    window.location.replace(appReturnUrl);
  };

  useEffect(() => {
    initPaddle().then((paddle) => setPaddleReady(Boolean(paddle)));
  }, []);

  // Paddle payment link lands here with ?_ptxn=txn_... — open checkout overlay.
  useEffect(() => {
    const ptxn = searchParams.get("_ptxn");
    if (!ptxn || !paddleReady || hasPremium || processing) return;
    void openPaddleCheckout(ptxn, {
      returnToApp,
      returnUrl: appReturnUrl || undefined,
    });
  }, [
    searchParams,
    paddleReady,
    hasPremium,
    processing,
    returnToApp,
    appReturnUrl,
  ]);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      toast.success("Payment received. Refreshing your subscription...");
      void refreshSubscription().finally(() => {
        if (returnToApp) {
          window.setTimeout(redirectBackToApp, 600);
        }
      });
    }
  }, [searchParams, refreshSubscription, returnToApp, appReturnUrl]);

  useEffect(() => {
    if (!returnToApp || isLoading || !hasPremium) return;
    if (searchParams.get("success") === "1") return;
    window.setTimeout(redirectBackToApp, 400);
  }, [hasPremium, isLoading, returnToApp, appReturnUrl, searchParams]);

  useEffect(() => {
    if (!isLoading && hasPremium) {
      toast.success("You have Bebio Plus!");
    }
  }, [hasPremium, isLoading]);

  const startCheckout = async () => {
    if (!user) {
      setCheckoutAfterAuth(true);
      setAuthOpen(true);
      return;
    }

    if (!paddleReady) {
      toast.error("Payment system is still loading. Please try again.");
      return;
    }

    setProcessing(true);
    try {
      const response = await createSubscriptionCheckout(billingPlan);
      if (!response.success) {
        throw new Error("Failed to create checkout session");
      }

      if (response.transaction_id) {
        await openPaddleCheckout(response.transaction_id, {
          returnToApp,
          returnUrl: appReturnUrl || undefined,
        });
        return;
      }

      if (response.checkout_url) {
        window.location.assign(response.checkout_url);
        return;
      }

      throw new Error("Failed to create checkout session");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Checkout failed";
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!checkoutAfterAuth || !user || hasPremium) return;
    if (!paddleReady) return;
    setCheckoutAfterAuth(false);
    void startCheckout();
  }, [checkoutAfterAuth, user, paddleReady, hasPremium]);

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#2C1810]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D95C74] text-white">
            <Baby size={18} />
          </div>
          Bebio
        </Link>
        <Link to="/" className="text-sm text-[#9B7B72] hover:text-[#2C1810]">
          Back to home
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16 pt-6">
        <div className="rounded-[32px] bg-gradient-to-br from-[#D95C74] to-[#E11D48] p-8 text-white">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles size={22} />
          </div>
          <h1 className="text-3xl font-bold">Bebio Plus</h1>
          <p className="mt-3 max-w-xl text-white/90">
            Unlimited tracking, AI guidance, and premium insights — synced to
            your mobile app when you sign in with the same account.
          </p>
        </div>

        {hasPremium ? (
          <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6 text-center">
            <p className="font-semibold text-green-800">
              Your account has active Bebio Plus access.
            </p>
            <p className="mt-2 text-sm text-green-700">
              Open the Bebio app and sign in to use premium features.
            </p>
            <button
              onClick={() => refreshSubscription()}
              className="mt-4 text-sm font-medium text-green-800 underline"
            >
              Refresh status
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-white p-2 shadow-sm">
              {(["monthly", "yearly"] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => setBillingPlan(plan)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    billingPlan === plan
                      ? "bg-[#D95C74] text-white"
                      : "text-[#9B7B72]"
                  }`}
                >
                  {plan === "monthly" ? "Monthly" : "Yearly"}
                  {plan === "yearly" && plans.yearly.savings ? (
                    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      Save {plans.yearly.savings}%
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-[rgba(44,24,16,0.09)] bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Bebio Plus</h2>
                  <p className="mt-1 text-sm text-[#9B7B72]">
                    Billed {billingPlan === "monthly" ? "monthly" : "yearly"} via
                    Paddle
                  </p>
                </div>
                <p className="text-3xl font-bold">
                  {plans[billingPlan].label}
                </p>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Unlimited AI parenting assistant",
                  "Unlimited logs across every feature",
                  "Export health reports",
                  "Works on iOS and Android with the same account",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check size={16} className="mt-0.5 text-[#D95C74]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={startCheckout}
              disabled={processing || authLoading || isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D95C74] px-5 py-4 text-base font-semibold text-white disabled:opacity-60"
            >
              {processing ? <Loader2 className="animate-spin" size={18} /> : null}
              {user ? "Subscribe to Bebio Plus" : "Sign in to subscribe"}
            </button>

            <p className="mt-4 text-center text-xs text-[#9B7B72]">
              Secure checkout powered by Paddle. Cancel anytime from your Paddle
              customer portal.
            </p>
          </>
        )}

        <div className="mt-8 flex justify-center gap-4 text-sm text-[#9B7B72]">
          <Link to="/terms" className="underline">
            Terms
          </Link>
          <Link to="/privacy" className="underline">
            Privacy
          </Link>
        </div>
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setCheckoutAfterAuth(false);
        }}
        onSuccess={() => {
          setAuthOpen(false);
          navigate("/upgrade");
        }}
      />
    </div>
  );
}
