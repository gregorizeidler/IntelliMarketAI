"use client";

import { useState } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function TemporalAnalysis({ data }: { data: any }) {
  const { result } = useAnalysisStore();
  const [temporalData, setTemporalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeTemporalTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      // Coleta reviews com datas
      const reviewsWithDates: any[] = [];
      result?.competitors?.forEach((competitor: any) => {
        if (competitor.place.reviews) {
          competitor.place.reviews.forEach((review: any) => {
            if (review.text?.text && review.publishTime) {
              reviewsWithDates.push({
                text: review.text.text,
                date: review.publishTime,
                rating: review.rating || 0,
                competitor: competitor.place.display_name,
              });
            }
          });
        }
      });

      if (reviewsWithDates.length === 0) {
        setError("Nenhum review com data disponível para análise");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/api/advanced/review-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews_with_dates: reviewsWithDates,
          business_type: result?.request?.business_type || "estabelecimento",
        }),
      });
      const analysisData = await response.json();
      setTemporalData(analysisData.data || analysisData);
    } catch (err) {
      setError("Erro ao analisar tendências temporais");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">📈</div>
        <h2 className="text-2xl font-bold mb-2">Análise Temporal</h2>
        <p className="text-gray-600">Faça uma análise primeiro</p>
      </div>
    );
  }

  const getTrendColor = (tendencia: string) => {
    const t = tendencia.toLowerCase();
    if (t.includes("melhor") || t.includes("crescendo")) return "text-green-600 bg-green-50";
    if (t.includes("pior") || t.includes("declin")) return "text-red-600 bg-red-50";
    return "text-blue-600 bg-blue-50";
  };

  const getTrendIcon = (tendencia: string) => {
    const t = tendencia.toLowerCase();
    if (t.includes("melhor") || t.includes("crescendo")) return "📈";
    if (t.includes("pior") || t.includes("declin")) return "📉";
    return "➡️";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">📈</div>
          <h2 className="text-2xl font-bold">Análise Temporal de Tendências</h2>
        </div>
        <p className="text-gray-600">
          Identifique como o mercado evoluiu ao longo do tempo
        </p>
      </div>

      {/* Analyze Button */}
      {!temporalData && (
        <div className="glass rounded-2xl p-8 text-center">
          <button
            onClick={analyzeTemporalTrends}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Analisando Tendências...
              </span>
            ) : (
              <span>📊 Analisar Tendências Temporais</span>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Análise baseada em reviews com datas
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass rounded-2xl p-4 border-2 border-red-500/50 bg-red-50">
          <p className="text-red-700 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Results */}
      {temporalData && (
        <>
          {/* Sentimento Geral */}
          {temporalData.sentimento_geral && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💭</span>
                <span>Sentimento Geral</span>
              </h3>
              <div className="flex items-center gap-6">
                <div className={`flex-1 p-6 rounded-xl ${getTrendColor(temporalData.sentimento_geral.tendencia)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{getTrendIcon(temporalData.sentimento_geral.tendencia)}</span>
                    <div>
                      <div className="font-bold text-2xl">
                        {temporalData.sentimento_geral.tendencia}
                      </div>
                      <div className="text-sm opacity-80">
                        {temporalData.sentimento_geral.variacao_percentual}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Problemas Emergentes */}
          {temporalData.problemas_emergentes && temporalData.problemas_emergentes.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⚠️</span>
                <span>Problemas Emergentes</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Questões que começaram a aparecer recentemente
              </p>
              <ul className="space-y-3">
                {temporalData.problemas_emergentes.map((problema: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <span className="text-red-600 font-bold text-lg">⚠</span>
                    <span className="text-gray-700 flex-1">{problema}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Melhorias Percebidas */}
          {temporalData.melhorias_percebidas && temporalData.melhorias_percebidas.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>✨</span>
                <span>Melhorias Percebidas</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Mudanças positivas notadas pelos clientes
              </p>
              <ul className="space-y-3">
                {temporalData.melhorias_percebidas.map((melhoria: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span className="text-gray-700 flex-1">{melhoria}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sazonalidade */}
          {temporalData.sazonalidade && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🌡️</span>
                <span>Sazonalidade</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <span>🔥</span>
                    <span>Períodos de Alta</span>
                  </h4>
                  <div className="space-y-2">
                    {temporalData.sazonalidade.periodos_alta?.map((periodo: string, idx: number) => (
                      <div
                        key={idx}
                        className="px-4 py-3 bg-orange-100 text-orange-800 rounded-lg font-medium"
                      >
                        {periodo}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-700 mb-3 flex items-center gap-2">
                    <span>❄️</span>
                    <span>Períodos de Baixa</span>
                  </h4>
                  <div className="space-y-2">
                    {temporalData.sazonalidade.periodos_baixa?.map((periodo: string, idx: number) => (
                      <div
                        key={idx}
                        className="px-4 py-3 bg-cyan-100 text-cyan-800 rounded-lg font-medium"
                      >
                        {periodo}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Competidores em Movimento */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Crescendo */}
            {temporalData.competidores_crescendo && temporalData.competidores_crescendo.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🚀</span>
                  <span>Crescendo</span>
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Concorrentes com momentum positivo
                </p>
                <div className="space-y-2">
                  {temporalData.competidores_crescendo.map((nome: string, idx: number) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium flex items-center gap-2"
                    >
                      <span>📈</span>
                      <span>{nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Declinando */}
            {temporalData.competidores_declinando && temporalData.competidores_declinando.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📉</span>
                  <span>Declinando</span>
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Concorrentes com momentum negativo
                </p>
                <div className="space-y-2">
                  {temporalData.competidores_declinando.map((nome: string, idx: number) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium flex items-center gap-2"
                    >
                      <span>📉</span>
                      <span>{nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recomendação de Timing */}
          {temporalData.recomendacao_timing && (
            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⏰</span>
                <span>Melhor Momento para Entrar</span>
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {temporalData.recomendacao_timing}
              </p>
            </div>
          )}

          {/* Botão para Nova Análise */}
          <div className="glass rounded-2xl p-6 text-center">
            <button
              onClick={() => setTemporalData(null)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition"
            >
              🔄 Nova Análise
            </button>
          </div>
        </>
      )}
    </div>
  );
}

