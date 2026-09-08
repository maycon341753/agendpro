// Stub para integração futura com E-mail (Nodemailer, SendGrid, etc)
// Não implementar ainda - estrutura preparada
class EmailIntegration {
  constructor(config = {}) {
    this.provider = config.provider || process.env.EMAIL_PROVIDER || "smtp";
    this.enabled = Boolean(process.env.EMAIL_ENABLED === "true");
  }

  async send(to, subject, html, text = "") {
    if (!this.enabled) {
      console.log("[Email] Integração não configurada. Stub: enviar e-mail", { to, subject });
      return { success: false, reason: "integration_disabled" };
    }
    throw new Error("Email real integration não implementada ainda.");
  }

  async sendPasswordReset(user, resetLink) {
    return this.send(
      user.email,
      "Redefina sua senha - AgendPro",
      `<p>Olá, clique no link abaixo para redefinir sua senha:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      `Redefina sua senha: ${resetLink}`
    );
  }

  async sendAppointmentConfirmation(user, appointment, company) {
    return this.send(
      user.email,
      `Agendamento confirmado - ${company?.name || "AgendPro"}`,
      `<p>Seu agendamento foi confirmado!</p><p>Data: ${appointment.date} ${appointment.time}</p>`,
      `Agendamento confirmado: ${appointment.date} ${appointment.time}`
    );
  }
}

module.exports = EmailIntegration;
module.exports.EmailIntegration = EmailIntegration;
