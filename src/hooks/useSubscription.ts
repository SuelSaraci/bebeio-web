import { useCallback, useEffect, useState } from "react";
import { getSubscriptionStatus } from "../services/subscriptionsService";
import { useAuth } from "./useAuth";

export function useSubscription() {
  const { user } = useAuth();
  const [hasPremium, setHasPremium] = useState(false);
  const [planType, setPlanType] = useState("free");
  const [status, setStatus] = useState("inactive");
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setHasPremium(false);
      setPlanType("free");
      setStatus("inactive");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getSubscriptionStatus();
      const sub = response.subscription;
      const premium = Boolean(sub?.hasPremium);
      setHasPremium(premium);
      setPlanType(sub?.plan_type || "free");
      setStatus(sub?.status || "inactive");
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSubscription, 30000);
    return () => clearInterval(interval);
  }, [user, refreshSubscription]);

  useEffect(() => {
    if (!user) return;
    const onFocus = () => refreshSubscription();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, refreshSubscription]);

  return {
    hasPremium,
    planType,
    status,
    isLoading,
    refreshSubscription,
  };
}
