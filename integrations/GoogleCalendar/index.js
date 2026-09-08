// Stub para integração futura com Google Calendar
// Não implementar ainda - estrutura preparada
class GoogleCalendarIntegration {
  constructor(config = {}) {
    this.clientId = config.clientId || process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.GOOGLE_CLIENT_SECRET;
    this.enabled = Boolean(this.clientId && this.clientSecret);
  }

  async getAuthUrl(redirectUri) {
    if (!this.enabled) {
      console.log("[GoogleCalendar] Integração não configurada. Stub: auth URL");
      return null;
    }
    throw new Error("Google Calendar real integration não implementada ainda.");
  }

  async handleCallback(code) {
    if (!this.enabled) return null;
    throw new Error("Google Calendar real integration não implementada ainda.");
  }

  async createEvent(tokens, appointment, company) {
    if (!this.enabled) {
      console.log("[GoogleCalendar] Stub: criar evento", appointment?.id, company?.slug);
      return null;
    }
    throw new Error("Google Calendar real integration não implementada ainda.");
  }

  async updateEvent(tokens, eventId, appointment) {
    if (!this.enabled) return null;
    throw new Error("Google Calendar real integration não implementada ainda.");
  }

  async deleteEvent(tokens, eventId) {
    if (!this.enabled) return null;
    throw new Error("Google Calendar real integration não implementada ainda.");
  }
}

module.exports = GoogleCalendarIntegration;
module.exports.GoogleCalendarIntegration = GoogleCalendarIntegration;
