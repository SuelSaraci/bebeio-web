export type BillingPlan = "monthly" | "yearly";

/** Public pricing — must match Paddle catalog prices exactly. */
export const BEBIO_PLUS = {
  productName: "Bebio Plus",
  productCategory:
    "Parenting journal & baby activity tracker (software subscription — not a medical service)",
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
    "Unlimited activity logging (feeding, sleep, diapers, growth, milestones)",
    "Unlimited AI parenting tips based on your baby's age and daily logs",
    "Export care journal summaries (PDF)",
    "Sync Plus on iOS and Android with the same account",
  ],
  taxNote:
    "Local taxes (including VAT or sales tax) may apply and will be calculated at checkout.",
  billingNote:
    "Bebio Plus is a recurring software subscription processed by Paddle. Your plan renews automatically at the price shown until you cancel from the Paddle customer portal.",
  disclaimer:
    "Bebio is a parenting organizer and baby activity journal. It does not provide medical advice, diagnosis, or treatment.",
} as const;

export const plusFeatures = BEBIO_PLUS.features;
