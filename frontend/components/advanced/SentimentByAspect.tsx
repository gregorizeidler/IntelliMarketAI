"use client";

import { useState, useEffect } from "react";

export default function SentimentByAspect({ data }: { data: any }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!data || !data.competitors) return;

    setLoading(true);
    try {
      // Coleta todos os reviews
      const allReviews: string[] = [];
      // Nota: precisaríamos dos reviews no resultado, por agora usar summary
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/advanced/sentiment-by-aspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_type: data.input.business_type,
          reviews: data.competitors.flatMap((c: any) => 
            [c.ai.executive_summary, ...c.ai.strengths, ...c.ai.weaknesses]
          )
        })
      });

      const result = await response.json();
      setAnalysis(result.data);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao analisar. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  const aspects = [
    { key: "atendimento", icon: "👨‍💼", label: "Atendimento", color: "blue" },
    { key: "produto", icon: "📦", label: "Produto/Serviço", color: "green" },
    { key: "preco", icon: "💰", label: "Preço", color: "yellow" },
    { key: "ambiente", icon: "🏠", label: "Ambiente", color: "purple" },
    { key: "localizacao", icon: "📍", label: "Localização", color: "red" },
    { key: "agilidade", icon: "⚡", label: "Agilidade", color: "orange" },
  ];

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">🧠 Análise de Sentiment por Aspecto</h2>
        <p className="text-gray-600 mb-4">
          Entenda EXATAMENTE onde cada concorrente é forte ou fraco
        </p>
        {!analysis && (
          <button
            onClick={analyze}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Analisando..." : "🚀 Iniciar Análise por Aspecto"}
          </button>
        )}
      </div>

      {analysis && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aspects.map((aspect) => {
            const data = analysis[aspect.key];
            if (!data) return null;

            const scoreColor = 
              data.score >= 8 ? "from-green-500 to-emerald-600" :
              data.score >= 6 ? "from-blue-500 to-cyan-600" :
              data.score >= 4 ? "from-yellow-500 to-orange-600" :
              "from-red-500 to-pink-600";

            return (
              <div key={aspect.key} className="glass rounded-2xl p-6 card-hover shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{aspect.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{aspect.label}</h3>
                    <p className="text-sm text-gray-600">{data.total_mentions} menções</p>
                  </div>
                </div>

                <div className={`bg-gradient-to-r ${scoreColor} rounded-xl p-4 text-white mb-4`}>
                  <div className="text-3xl font-bold">{data.score.toFixed(1)}<span className="text-xl">/10</span></div>
                </div>

                <div className="space-y-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="text-sm font-bold text-green-800 mb-2">✓ Pontos Positivos</h4>
                    <ul className="text-xs text-green-900 space-y-1">
                      {data.positive_points?.slice(0, 3).map((p: string, i: number) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3">
                    <h4 className="text-sm font-bold text-red-800 mb-2">✕ Pontos Negativos</h4>
                    <ul className="text-xs text-red-900 space-y-1">
                      {data.negative_points?.slice(0, 3).map((p: string, i: number) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

