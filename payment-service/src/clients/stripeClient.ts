import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-10-28.acacia",
  typescript: true,
});

export default stripe;
