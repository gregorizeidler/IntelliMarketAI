function getSaturationBadge(level: string) {
  const levels: Record<string, { bg: string; text: string; emoji: string }> = {
    Baixa: { bg: "from-green-500 to-emerald-600", text: "Ótima oportunidade", emoji: "🚀" },
    Média: { bg: "from-yellow-500 to-orange-600", text: "Concorrência moderada", emoji: "⚖️" },
    Alta: { bg: "from-red-500 to-pink-600", text: "Mercado saturado", emoji: "🔥" },
  };
  return levels[level] || levels.Média;
}

export default function Report({ aggregated }: { aggregated: any }) {
  const saturation = getSaturationBadge(aggregated.market_saturation_level);

  return (
    <div className="glass rounded-2xl p-6 space-y-6 shadow-xl border border-white/50 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
          <span className="text-3xl">📊</span> Relatório Estratégico
        </h2>
        <div
          className={`bg-gradient-to-r ${saturation.bg} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2`}
        >
          <span className="text-xl">{saturation.emoji}</span>
          <div>
            <div className="text-xs font-medium opacity-90">Saturação</div>
            <div className="text-sm font-bold">{aggregated.market_saturation_level}</div>
          </div>
        </div>
      </div>

      {/* Saturation Info */}
      <div className={`bg-gradient-to-r ${saturation.bg} rounded-xl p-4 text-white`}>
        <div className="text-center">
          <div className="text-sm font-medium opacity-90">{saturation.text}</div>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Market Strengths */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
            <span className="text-2xl">💪</span> Forças do Mercado
          </h3>
          <div className="space-y-3">
            {aggregated.market_strengths_summary.map((s: string, i: number) => (
              <div
                key={i}
                className="bg-white rounded-lg p-3 shadow-sm border border-green-100 flex items-start gap-3"
              >
                <span className="text-green-500 text-xl shrink-0">✓</span>
                <span className="text-sm text-gray-800 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Gaps */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
            <span className="text-2xl">🎯</span> Lacunas & Oportunidades
          </h3>
          <div className="space-y-3">
            {aggregated.market_weaknesses_gaps.map((w: string, i: number) => (
              <div
                key={i}
                className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 flex items-start gap-3"
              >
                <span className="text-blue-500 text-xl shrink-0">💡</span>
                <span className="text-sm text-gray-800 font-medium">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Recommendation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full translate-y-32 -translate-x-32 blur-3xl" />
        
        <div className="relative z-10">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-xl">
            <span className="text-3xl">🎓</span> Recomendação Estratégica
          </h3>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <p className="text-white text-base leading-relaxed font-medium">
              {aggregated.strategic_recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
