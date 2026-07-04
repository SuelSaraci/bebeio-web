import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | null = null;

export async function initPaddle(): Promise<Paddle | null> {
  if (paddleInstance) return paddleInstance;

  const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
  const environment =
    (import.meta.env.VITE_PADDLE_ENVIRONMENT as "sandbox" | "production") ||
    "sandbox";

  if (!clientToken) {
    console.error("[Paddle] VITE_PADDLE_CLIENT_TOKEN is not configured");
    return null;
  }

  paddleInstance = await initializePaddle({
    token: clientToken,
    environment,
  });

  return paddleInstance;
}

export async function openPaddleCheckout(
  transactionId: string,
  options?: { returnToApp?: boolean; returnUrl?: string },
) {
  const paddle = paddleInstance || (await initPaddle());
  if (!paddle) throw new Error("Paddle not initialized");

  const returnToApp = options?.returnToApp === true;
  const returnUrl = options?.returnUrl?.trim();
  const successUrl = returnToApp
    ? `${window.location.origin}/upgrade?success=1&returnToApp=1${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ""}`
    : `${window.location.origin}/upgrade?success=1`;

  paddle.Checkout.open({
    transactionId,
    settings: {
      displayMode: "overlay",
      theme: "light",
      locale: "en",
      allowLogout: false,
      successUrl,
    },
  });
}
