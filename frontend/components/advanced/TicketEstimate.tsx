"use client";

import { useState } from "react";

export default function TicketEstimate({ data }: { data: any }) {
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/advanced/ticket-estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_type: data.input.business_type,
          reviews: data.competitors.flatMap((c: any) => [c.ai.executive_summary])
        })
      });
      const result = await response.json();
      setEstimate(result.data);
    } catch (error) {
      alert("Erro ao estimar ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">💰 Estimativa de Ticket Médio</h2>
        <p className="text-gray-600 mb-4">Baseado em menções de preços nos reviews</p>
        {!estimate && (
          <button onClick={analyze} disabled={loading} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold">
            {loading ? "Analisando..." : "🚀 Estimar Ticket"}
          </button>
        )}
      </div>

      {estimate && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-8 text-center shadow-xl">
            <div className="text-sm text-gray-600 mb-2">Ticket Médio Estimado</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {estimate.ticket_medio_estimado}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold mb-4">Faixa de Preços</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Mínimo:</strong> R$ {estimate.faixa_precos?.minimo}</p>
              <p><strong>Máximo:</strong> R$ {estimate.faixa_precos?.maximo}</p>
              <p><strong>Mais Comum:</strong> R$ {estimate.faixa_precos?.mais_comum}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 md:col-span-2">
            <h3 className="font-bold mb-4">Percepção de Preço</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-red-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{estimate.percepcao_preco?.considerado_caro}</div>
                <div className="text-xs text-red-800">Consideram Caro</div>
              </div>
              <div className="bg-blue-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{estimate.percepcao_preco?.considerado_justo}</div>
                <div className="text-xs text-blue-800">Consideram Justo</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{estimate.percepcao_preco?.considerado_barato}</div>
                <div className="text-xs text-green-800">Consideram Barato</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 md:col-span-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <h3 className="font-bold mb-3">🎯 Estratégia de Precificação</h3>
            <p>{estimate.estrategia_precificacao}</p>
          </div>
        </div>
      )}
    </div>
  );
}

