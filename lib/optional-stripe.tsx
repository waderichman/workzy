import { PropsWithChildren } from "react";

type StripeModule = typeof import("@stripe/stripe-react-native");

export type OptionalStripeClient = {
  initPaymentSheet: (options: {
    merchantDisplayName: string;
    paymentIntentClientSecret: string;
    returnURL: string;
  }) => Promise<{ error?: { message: string } }>;
  presentPaymentSheet: () => Promise<{ error?: { message: string } }>;
};

let cachedStripeModule: StripeModule | null | undefined;

function getStripeModule() {
  if (cachedStripeModule !== undefined) {
    return cachedStripeModule;
  }

  try {
    cachedStripeModule = require("@stripe/stripe-react-native") as StripeModule;
  } catch {
    cachedStripeModule = null;
  }

  return cachedStripeModule;
}

export function OptionalStripeProvider({
  publishableKey,
  children
}: PropsWithChildren<{ publishableKey: string }>) {
  const stripeModule = getStripeModule();

  if (!publishableKey || !stripeModule?.StripeProvider) {
    return <>{children}</>;
  }

  const Provider = stripeModule.StripeProvider;
  return <Provider publishableKey={publishableKey}>{<>{children}</>}</Provider>;
}

export function useOptionalStripe(): OptionalStripeClient | null {
  const stripeModule = getStripeModule();

  if (!stripeModule?.useStripe) {
    return null;
  }

  return stripeModule.useStripe();
}

export function isStripeAvailable() {
  const stripeModule = getStripeModule();
  return Boolean(stripeModule?.StripeProvider && stripeModule?.useStripe);
}
