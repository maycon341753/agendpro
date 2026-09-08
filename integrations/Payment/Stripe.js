// Stub para integração futura com Stripe
// Não implementar ainda - estrutura preparada
class StripeIntegration {
  constructor(secretKey = process.env.STRIPE_SECRET_KEY) {
    this.secretKey = secretKey;
    this.enabled = Boolean(this.secretKey);
    this.stripe = null;
    if (this.enabled) {
      // Inicialização futura:
      // const Stripe = require("stripe");
      // this.stripe = new Stripe(this.secretKey, { apiVersion: "2024-06-20" });
    }
  }

  async createCheckoutSession(plan, company) {
    if (!this.enabled) {
      console.log("[Stripe] Integração não configurada. Stub: checkout", plan?.name, company?.slug);
      return { success: false, reason: "integration_disabled", checkoutUrl: null };
    }
    throw new Error("Stripe real integration não implementada ainda.");
  }

  async createCustomer(company) {
    if (!this.enabled) return null;
    throw new Error("Stripe real integration não implementada ainda.");
  }

  async handleWebhook(payload, sig) {
    if (!this.enabled) return null;
    throw new Error("Stripe real integration não implementada ainda.");
  }
}

module.exports = StripeIntegration;
module.exports.StripeIntegration = StripeIntegration;
