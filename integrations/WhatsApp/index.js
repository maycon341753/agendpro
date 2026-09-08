// Stub para integração futura com WhatsApp
// Não implementar ainda - estrutura preparada
class WhatsAppIntegration {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.WHATSAPP_API_KEY;
    this.phoneNumberId = config.phoneNumberId || process.env.WHATSAPP_PHONE_ID;
    this.enabled = Boolean(this.apiKey && this.phoneNumberId);
  }

  async sendAppointmentConfirmation(appointment) {
    if (!this.enabled) {
      console.log("[WhatsApp] Integração não configurada. Stub: enviar confirmação", appointment?.id);
      return { success: false, reason: "integration_disabled" };
    }
    throw new Error("WhatsApp real integration não implementada ainda.");
  }

  async sendAppointmentReminder(appointment, hoursBefore = 24) {
    if (!this.enabled) {
      console.log("[WhatsApp] Stub: lembrete de atendimento", appointment?.id, `${hoursBefore}h antes`);
      return { success: false, reason: "integration_disabled" };
    }
    throw new Error("WhatsApp real integration não implementada ainda.");
  }

  async sendCancelNotification(appointment) {
    if (!this.enabled) {
      console.log("[WhatsApp] Stub: cancelamento notificado", appointment?.id);
      return { success: false, reason: "integration_disabled" };
    }
    throw new Error("WhatsApp real integration não implementada ainda.");
  }
}

module.exports = WhatsAppIntegration;
module.exports.WhatsAppIntegration = WhatsAppIntegration;
