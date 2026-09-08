export default function handler(req, res) {
  res.status(200).json({
    name: "AgendPro SaaS API",
    version: "0.1.0",
    status: "online",
    docs: "Configure Supabase e use as rotas /api/*",
  });
}
