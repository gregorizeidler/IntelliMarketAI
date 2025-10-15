"use client";

type ComparisonViewProps = {
  results: any[];
};

function getScoreColor(score?: number) {
  if (score == null) return "text-gray-500";
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-blue-600";
  if (score >= 4) return "text-yellow-600";
  return "text-red-600";
}

function getSaturationColor(level: string) {
  if (level === "Baixa") return "bg-green-100 text-green-800 border-green-300";
  if (level === "Alta") return "bg-red-100 text-red-800 border-red-300";
  return "bg-yellow-100 text-yellow-800 border-yellow-300";
}

export default function ComparisonView({ results }: ComparisonViewProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Comparison Header */}
      <div className="glass rounded-2xl p-6 shadow-xl border border-white/50">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2 mb-4">
          <span className="text-3xl">⚖️</span> Comparação de Áreas
        </h2>
        <p className="text-gray-600">
          Análise comparativa de {results.length} região{results.length > 1 ? "ões" : ""}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="glass rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Área</th>
                <th className="px-6 py-4 text-center font-bold">Concorrentes</th>
                <th className="px-6 py-4 text-center font-bold">Saturação</th>
                <th className="px-6 py-4 text-center font-bold">Sentimento Médio</th>
                <th className="px-6 py-4 text-center font-bold">Raio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result, idx) => {
                const avgSentiment =
                  result.competitors.length > 0
                    ? result.competitors.reduce(
                        (sum: number, c: any) => sum + (c.ai?.overall_sentiment_score || 0),
                        0
                      ) / result.competitors.length
                    : 0;

                return (
                  <tr key={idx} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{result.input.address}</div>
                      <div className="text-sm text-gray-500">{result.input.business_type}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold rounded-full w-12 h-12">
                        {result.competitors.length}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getSaturationColor(
                          result.aggregated_report.market_saturation_level
                        )}`}
                      >
                        {result.aggregated_report.market_saturation_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(avgSentiment)}`}>
                        {avgSentiment.toFixed(1)}
                        <span className="text-sm text-gray-500">/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 font-medium">
                      {result.radius}m
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Comparison Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, idx) => (
          <div
            key={idx}
            className="glass rounded-2xl p-6 space-y-4 shadow-lg border border-white/50 card-hover"
          >
            {/* Area Header */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                📍 Área {idx + 1}
              </h3>
              <p className="text-sm text-gray-600">{result.input.address}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.competitors.length}
                </div>
                <div className="text-xs text-blue-800 mt-1">Concorrentes</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result.radius}m
                </div>
                <div className="text-xs text-purple-800 mt-1">Raio</div>
              </div>
            </div>

            {/* Saturation */}
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-2">SATURAÇÃO</div>
              <div
                className={`rounded-lg p-3 text-center font-bold border ${getSaturationColor(
                  result.aggregated_report.market_saturation_level
                )}`}
              >
                {result.aggregated_report.market_saturation_level}
              </div>
            </div>

            {/* Top Opportunities */}
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-2">
                PRINCIPAIS OPORTUNIDADES
              </div>
              <div className="space-y-2">
                {result.aggregated_report.market_weaknesses_gaps
                  .slice(0, 2)
                  .map((gap: string, i: number) => (
                    <div
                      key={i}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 text-xs text-gray-800 border border-green-200"
                    >
                      💡 {gap}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

