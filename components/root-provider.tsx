import { PropsWithChildren, useEffect } from "react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import { OptionalStripeProvider } from "@/lib/optional-stripe";
import { useAppStore } from "@/store/use-app-store";

export function RootProvider({ children }: PropsWithChildren) {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const hydrateAuthSession = useAppStore((state) => state.hydrateAuthSession);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      void hydrateAuthSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [hydrateAuthSession]);

  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <OptionalStripeProvider publishableKey={publishableKey}>
      <>{children}</>
    </OptionalStripeProvider>
  );
}
