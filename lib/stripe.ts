import Stripe from "stripe";

/**
 * Server-side Stripe client. Initialised lazily so that importing this module
 * (e.g. during `next build`) never throws when the key isn't set — it only
 * throws when an API route actually tries to talk to Stripe at request time.
 */
let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripe) return stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Copy .env.example to .env.local and add your Stripe secret key."
    );
  }

  stripe = new Stripe(key, {
    apiVersion: "2024-06-20",
    // Keep ASCII only — this becomes an HTTP User-Agent header, which rejects
    // non-ASCII characters (e.g. an em-dash) with ERR_INVALID_CHAR.
    appInfo: { name: "Horizont Visuals Design Express" },
  });
  return stripe;
}
