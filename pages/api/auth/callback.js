import { supabaseAdmin } from "@/lib/supabaseServer";

export default async function callbackHandler(req, res) {
  const { method, query } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { code, type, next, error, error_description, access_token, refresh_token, token_type, expires_in } = query;

    if (error) {
      console.error("Erro no callback OAuth:", error, error_description);
      return res.redirect(`/login?error=${encodeURIComponent(error_description || error)}`);
    }

    if (code) {
      return res.redirect(`/login?code=${code}&type=${type || ""}`);
    }

    if (access_token) {
      const redirectUrl = typeof next === "string" && next.startsWith("/")
        ? next
        : "/dashboard";
      return res.redirect(redirectUrl);
    }

    return res.redirect("/login");
  } catch (error) {
    console.error("Erro no handler de callback:", error);
    return res.redirect("/login?error=callback_error");
  }
}
