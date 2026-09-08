import "@/styles/globals.css";
import Head from "next/head";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/Toaster";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>AgendPro - Sistema de Agendamento e Gestão</title>
        <meta
          name="description"
          content="Seu negócio organizado. Seus clientes agendados. Seu atendimento mais profissional."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster />
      </AuthProvider>
    </>
  );
}
