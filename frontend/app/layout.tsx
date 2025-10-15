"use client";

import "./../styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <html lang="pt-BR">
      <head>
        <title>IntelliMarket Analyzer | Inteligência de Mercado com IA</title>
        <meta name="description" content="Análise de mercado local potencializada por IA" />
      </head>
      <body className="min-h-screen text-slate-900 relative overflow-x-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100" />
          
          {/* Animated blobs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000" />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
        </div>

        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
