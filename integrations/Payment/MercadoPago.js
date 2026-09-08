// Stub para integração futura com Mercado Pago
// Não implementar ainda - estrutura preparada
class MercadoPagoIntegration {
  constructor(accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN) {
    this.accessToken = accessToken;
    this.enabled = Boolean(this.accessToken);
    this.mp = null;
    if (this.enabled) {
      // Inicialização futura:
      // const mercadopago = require("mercadopago");
      // mercadopago.configure({ access_token: accessToken });
      // this.mp = mercadopago;
    }
  }

  async createPaymentPreference(order, company) {
    if (!this.enabled) {
      console.log("[MercadoPago] Integração não configurada. Stub: preference", order?.id);
      return { success: false, reason: "integration_disabled", init_point: null, sandbox_init_point: null };
    }
    throw new Error("Mercado Pago real integration não implementada ainda.");
  }

  async createPixPayment(amount, payer) {
    if (!this.enabled) return null;
    throw new Error("Mercado Pago real integration não implementada ainda.");
  }

  async handleWebhook(payload) {
    if (!this.enabled) return null;
    throw new Error("Mercado Pago real integration não implementada ainda.");
  }
}

module.exports = MercadoPagoIntegration;
module.exports.MercadoPagoIntegration = MercadoPagoIntegration;
