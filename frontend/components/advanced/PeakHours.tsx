"use client";

import { useState } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function PeakHours({ data }: { data: any }) {
  const { result } = useAnalysisStore();
  const [peakData, setPeakData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePeakHours = async () => {
    setLoading(true);
    setError(null);
    try {
      // Coleta todos os reviews dos concorrentes
      const allReviews: string[] = [];
      result?.competitors?.forEach((competitor: any) => {
        if (competitor.place.reviews) {
          competitor.place.reviews.forEach((review: any) => {
            if (review.text?.text) {
              allReviews.push(review.text.text);
            }
          });
        }
      });

      if (allReviews.length === 0) {
        setError("Nenhum review disponível para análise");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/api/advanced/peak-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews: allReviews,
          popular_times_data: null, // Opcional: dados do Google Popular Times
        }),
      });
      const analysisData = await response.json();
      setPeakData(analysisData.data || analysisData);
    } catch (err) {
      setError("Erro ao analisar horários de pico");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">🕐</div>
        <h2 className="text-2xl font-bold mb-2">Análise de Horários de Pico</h2>
        <p className="text-gray-600">Faça uma análise primeiro</p>
      </div>
    );
  }

  const getMovementColor = (movimento: string) => {
    const m = movimento.toLowerCase();
    if (m.includes("muito alto") || m.includes("altíssimo")) return "bg-red-500";
    if (m.includes("alto")) return "bg-orange-500";
    if (m.includes("médio") || m.includes("moderado")) return "bg-yellow-500";
    if (m.includes("baixo")) return "bg-green-500";
    return "bg-gray-500";
  };

  const getMovementWidth = (movimento: string) => {
    const m = movimento.toLowerCase();
    if (m.includes("muito alto") || m.includes("altíssimo")) return "w-full";
    if (m.includes("alto")) return "w-4/5";
    if (m.includes("médio") || m.includes("moderado")) return "w-3/5";
    if (m.includes("baixo")) return "w-2/5";
    return "w-1/2";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">🕐</div>
          <h2 className="text-2xl font-bold">Análise de Horários de Pico</h2>
        </div>
        <p className="text-gray-600">
          Identifique padrões de movimento e horários mais movimentados
        </p>
      </div>

      {/* Analyze Button */}
      {!peakData && (
        <div className="glass rounded-2xl p-8 text-center">
          <button
            onClick={analyzePeakHours}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white rounded-xl font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Analisando Padrões...
              </span>
            ) : (
              <span>📊 Analisar Horários de Pico</span>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Análise baseada em {result?.competitors?.length || 0} concorrentes
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
      {peakData && (
        <>
          {/* Horários de Pico */}
          {peakData.horarios_pico && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⏰</span>
                <span>Horários de Pico</span>
              </h3>
              <div className="space-y-4">
                {peakData.horarios_pico.map((horario: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        {horario.periodo}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {horario.movimento}
                        </span>
                        {horario.mencoes && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {horario.mencoes} menções
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getMovementColor(horario.movimento)} ${getMovementWidth(horario.movimento)} transition-all duration-500 rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dias da Semana */}
          {peakData.dias_semana && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📅</span>
                <span>Dias da Semana</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <span>📈</span>
                    <span>Mais Movimentados</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {peakData.dias_semana.mais_movimentados?.map((dia: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium shadow-sm"
                      >
                        {dia}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <span>📉</span>
                    <span>Menos Movimentados</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {peakData.dias_semana.menos_movimentados?.map((dia: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium shadow-sm"
                      >
                        {dia}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tempo de Espera */}
          {peakData.tempo_espera && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⏱️</span>
                <span>Tempo de Espera</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="font-bold text-gray-700 mb-1">Médio</div>
                  <div className="text-lg text-yellow-700">{peakData.tempo_espera.medio}</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="font-bold text-gray-700 mb-1">Pico</div>
                  <div className="text-lg text-red-700">{peakData.tempo_espera.pico}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="font-bold text-gray-700 mb-1">Fora de Pico</div>
                  <div className="text-lg text-green-700">{peakData.tempo_espera.fora_pico}</div>
                </div>
              </div>
            </div>
          )}

          {/* Reclamações sobre Espera */}
          {peakData.reclamacoes_espera && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⚠️</span>
                <span>Reclamações sobre Espera</span>
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {peakData.reclamacoes_espera.total}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {peakData.reclamacoes_espera.percentual}
                  </div>
                  <div className="text-sm text-gray-600">dos reviews</div>
                </div>
              </div>
              {peakData.reclamacoes_espera.citacoes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700 text-sm">Citações:</h4>
                  {peakData.reclamacoes_espera.citacoes.map((citacao: string, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-700 italic">"{citacao}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Oportunidades de Horário */}
          {peakData.oportunidades_horario && peakData.oportunidades_horario.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💡</span>
                <span>Oportunidades de Horário</span>
              </h3>
              <ul className="space-y-2">
                {peakData.oportunidades_horario.map((oportunidade: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold text-xl">★</span>
                    <span className="text-gray-700">{oportunidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recomendação de Operação */}
          {peakData.recomendacao_operacao && (
            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎯</span>
                <span>Recomendação de Operação</span>
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {peakData.recomendacao_operacao}
              </p>
            </div>
          )}

          {/* Botão para Nova Análise */}
          <div className="glass rounded-2xl p-6 text-center">
            <button
              onClick={() => setPeakData(null)}
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

