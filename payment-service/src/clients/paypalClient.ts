import paypal from "@paypal/checkout-server-sdk";

// Configure PayPal environment
const environment =
  process.env.NODE_ENV === "production"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID as string,
        process.env.PAYPAL_CLIENT_SECRET as string
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID as string,
        process.env.PAYPAL_CLIENT_SECRET as string
      );

// Initialize PayPal client
const client = new paypal.core.PayPalHttpClient(environment);

export default client;
