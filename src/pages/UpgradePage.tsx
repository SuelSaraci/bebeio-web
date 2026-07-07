import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Baby, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import { AuthModal } from "../components/AuthModal";
import { createSubscriptionCheckout } from "../services/subscriptionsService";
import { initPaddle, openPaddleCheckout } from "../services/paddleService";
import { BEBIO_PLUS, type BillingPlan } from "../lib/pricing";

const plans = BEBIO_PLUS.plans;

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

      <main className="mx-auto max-w-3xl px-6 pb-16 pt-6" id="pricing">
        <div className="rounded-[32px] bg-gradient-to-br from-[#D95C74] to-[#E11D48] p-8 text-white">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles size={22} />
          </div>
          <h1 className="text-3xl font-bold">{BEBIO_PLUS.productName}</h1>
          <p className="mt-3 max-w-xl text-white/90">
            Software subscription for the Bebio parenting journal — unlimited
            logging, AI parenting tips, and journal exports. Sign in with the
            same account on iOS or Android after purchase.
          </p>
          <p className="mt-4 text-sm text-white/80">{BEBIO_PLUS.disclaimer}</p>
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
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {(["monthly", "yearly"] as const).map((plan) => {
                const details = plans[plan];
                const selected = billingPlan === plan;
                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setBillingPlan(plan)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      selected
                        ? "border-[#D95C74] bg-[#FFF0EC] ring-2 ring-[#D95C74]"
                        : "border-[rgba(44,24,16,0.09)] bg-white"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#9B7B72]">
                      {details.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold">{details.priceLabel}</p>
                    <p className="text-sm font-medium text-[#2C1810]">
                      {BEBIO_PLUS.currency} / {details.interval}
                    </p>
                    <p className="mt-2 text-sm text-[#9B7B72]">
                      {details.description}
                    </p>
                    {plan === "yearly" && details.savingsPercent ? (
                      <p className="mt-2 text-xs font-semibold text-[#D95C74]">
                        Save {details.savingsPercent}% vs monthly billing
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-3xl border border-[rgba(44,24,16,0.09)] bg-white p-6">
              <div className="flex items-start justify-between gap-4 border-b border-[rgba(44,24,16,0.09)] pb-5">
                <div>
                  <h2 className="text-xl font-bold">{BEBIO_PLUS.productName}</h2>
                  <p className="mt-1 text-sm text-[#9B7B72]">
                    {plans[billingPlan].billingLabel} · recurring subscription
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {plans[billingPlan].priceLabel}
                  </p>
                  <p className="text-sm text-[#9B7B72]">
                    per {plans[billingPlan].interval}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-[#2C1810]">
                What&apos;s included
              </p>
              <ul className="mt-3 space-y-3 text-sm">
                {BEBIO_PLUS.features.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check size={16} className="mt-0.5 shrink-0 text-[#D95C74]" />
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
              {user
                ? `Subscribe — ${plans[billingPlan].billingLabel}`
                : "Sign in to subscribe"}
            </button>

            <div className="mt-4 space-y-2 text-center text-xs leading-5 text-[#9B7B72]">
              <p>
                The price at checkout will match the plan selected above (
                {plans[billingPlan].billingLabel}).
              </p>
              <p>{BEBIO_PLUS.taxNote}</p>
              <p>{BEBIO_PLUS.billingNote}</p>
              <p>{BEBIO_PLUS.disclaimer}</p>
              <p>
                Secure checkout powered by Paddle. Cancel anytime from your
                Paddle customer portal.
              </p>
            </div>
          </>
        )}

        <div className="mt-8 flex justify-center gap-4 text-sm text-[#9B7B72]">
          <Link to="/terms" className="underline">
            Terms
          </Link>
          <Link to="/privacy" className="underline">
            Privacy
          </Link>
          <Link to="/contact" className="underline">
            Contact
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
