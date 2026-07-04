import { axiosInstance } from "../lib/apiClient";

export type BillingPlan = "monthly" | "yearly";

export interface SubscriptionRecord {
  status: string;
  plan_type: string;
  hasPremium?: boolean;
}

export const createSubscriptionCheckout = async (plan: BillingPlan) => {
  const response = await axiosInstance.post<{
    success: boolean;
    transaction_id?: string;
    checkout_url?: string;
  }>("/api/subscriptions/create", { plan });
  return response.data;
};

export const getSubscriptionStatus = async () => {
  const response = await axiosInstance.get<{
    success: boolean;
    subscription: SubscriptionRecord;
  }>("/api/subscriptions/status");
  return response.data;
};
