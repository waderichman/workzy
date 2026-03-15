import { PropsWithChildren, useEffect } from "react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
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

  return children;
}
