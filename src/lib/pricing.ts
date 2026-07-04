export type BillingPlan = "monthly" | "yearly";

/** Public pricing — must match Paddle catalog prices exactly. */
export const BEBIO_PLUS = {
  productName: "Bebio Plus",
  currency: "USD",
  plans: {
    monthly: {
      id: "monthly" as const,
      label: "Monthly",
      price: 5,
      priceLabel: "$5.00",
      interval: "month",
      billingLabel: "$5.00 USD per month",
      shortLabel: "$5.00/mo",
      description: "Billed monthly. Renews every month until cancelled.",
    },
    yearly: {
      id: "yearly" as const,
      label: "Yearly",
      price: 50,
      priceLabel: "$50.00",
      interval: "year",
      billingLabel: "$50.00 USD per year",
      shortLabel: "$50.00/yr",
      description: "Billed yearly. Renews every year until cancelled.",
      savingsPercent: 17,
    },
  },
  features: [
    "Unlimited AI parenting assistant",
    "Unlimited logs across every feature (feeding, sleep, diapers, growth, and more)",
    "Export baby health reports",
    "Sync premium access on iOS and Android with the same account",
  ],
  taxNote:
    "Local taxes (including VAT or sales tax) may apply and will be calculated at checkout.",
  billingNote:
    "Bebio Plus is a recurring subscription processed by Paddle. Your plan renews automatically at the price shown until you cancel from the Paddle customer portal.",
} as const;

export const plusFeatures = BEBIO_PLUS.features;
