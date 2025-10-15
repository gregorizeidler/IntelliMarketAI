"use client";

import { useState } from "react";

export default function CustomerPersona({ data }: { data: any }) {
  const [persona, setPersona] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/advanced/customer-persona`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_type: data.input.business_type,
          all_reviews: data.competitors.flatMap((c: any) => 
            [c.ai.executive_summary, ...c.ai.strengths, ...c.ai.weaknesses]
          ),
          competitor_names: data.competitors.map((c: any) => c.place.display_name)
        })
      });
      const result = await response.json();
      setPersona(result.data);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar persona");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">👥 Persona do Cliente Ideal</h2>
        <p className="text-gray-600 mb-4">
          Conheça profundamente quem é seu cliente típico
        </p>
        {!persona && (
          <button
            onClick={generate}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Gerando..." : "🚀 Gerar Persona"}
          </button>
        )}
      </div>

      {persona && (
        <div className="glass rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-3xl font-bold mb-2">{persona.nome_persona}</h3>
            <p className="text-gray-600">{persona.conceito_principal}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">📊</span> Demografia
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Faixa Etária:</strong> {persona.demografia?.faixa_etaria}</p>
                <p><strong>Gênero:</strong> {persona.demografia?.genero_predominante}</p>
                <p><strong>Renda:</strong> {persona.demografia?.nivel_renda}</p>
                <p><strong>Ocupação:</strong> {persona.demografia?.ocupacao}</p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span> Comportamento
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Frequência:</strong> {persona.comportamento?.frequencia_visita}</p>
                <p><strong>Horário:</strong> {persona.comportamento?.horario_preferido}</p>
                <p><strong>Ticket Médio:</strong> {persona.comportamento?.ticket_medio_estimado}</p>
                <p><strong>Pagamento:</strong> {persona.comportamento?.forma_pagamento}</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">💚</span> Valores & Prioridades
              </h4>
              <ul className="space-y-2 text-sm">
                {persona.valores_prioridades?.map((v: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-xl p-6">
              <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">😟</span> Dores & Problemas
              </h4>
              <ul className="space-y-2 text-sm">
                {persona.dores_problemas?.map((d: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
            <h4 className="font-bold mb-3 text-xl">🎯 Como Conquistar Esta Persona</h4>
            <p className="leading-relaxed">{persona.como_conquistar}</p>
          </div>
        </div>
      )}
    </div>
  );
}

