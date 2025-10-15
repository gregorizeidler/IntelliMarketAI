"use client";

export default function LocationRecommendation({ singleResult, comparisonResults }: { singleResult: any, comparisonResults: any[] }) {
  const hasComparison = comparisonResults && comparisonResults.length > 1;

  if (!hasComparison) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold mb-4">Recomendação de Localização</h2>
        <p className="text-gray-600 mb-4">Esta feature requer análise em modo "Comparar Áreas"</p>
        <p className="text-sm text-gray-500">Volte à página inicial e compare 2 ou mais áreas para ver a recomendação</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">🎯 Recomendação de Localização Ideal</h2>
        <p className="text-gray-600">Análise comparativa de {comparisonResults.length} áreas</p>
      </div>

      <div className="grid gap-6">
        {comparisonResults.map((result, idx) => (
          <div key={idx} className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">📍 {result.input.address}</h3>
                <p className="text-sm text-gray-600">{result.competitors.length} concorrentes encontrados</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                result.aggregated_report.market_saturation_level === "Baixa" ? "bg-green-100 text-green-800" :
                result.aggregated_report.market_saturation_level === "Alta" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {result.aggregated_report.market_saturation_level}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-bold text-green-900 text-sm mb-2">Oportunidades</h4>
                <ul className="text-xs space-y-1">
                  {result.aggregated_report.market_weaknesses_gaps.slice(0, 3).map((gap: string, i: number) => (
                    <li key={i}>• {gap}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 text-sm mb-2">Forças do Mercado</h4>
                <ul className="text-xs space-y-1">
                  {result.aggregated_report.market_strengths_summary.slice(0, 3).map((strength: string, i: number) => (
                    <li key={i}>• {strength}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

