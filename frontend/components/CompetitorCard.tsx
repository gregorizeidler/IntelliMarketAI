function getSentimentColor(score?: number) {
  if (score == null) return "from-gray-400 to-gray-500";
  if (score >= 8) return "from-green-400 to-emerald-500";
  if (score >= 6) return "from-blue-400 to-cyan-500";
  if (score >= 4) return "from-yellow-400 to-orange-500";
  return "from-red-400 to-pink-500";
}

function getSentimentEmoji(score?: number) {
  if (score == null) return "😐";
  if (score >= 8) return "😍";
  if (score >= 6) return "😊";
  if (score >= 4) return "😕";
  return "😞";
}

export default function CompetitorCard({ competitor }: { competitor: any }) {
  const p = competitor.place;
  const ai = competitor.ai;
  const sentimentColor = getSentimentColor(ai.overall_sentiment_score);
  const sentimentEmoji = getSentimentEmoji(ai.overall_sentiment_score);

  return (
    <div className="glass rounded-2xl p-6 space-y-4 card-hover shadow-lg border border-white/50">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{p.display_name}</h3>
          <p className="text-sm text-gray-600 mt-1">{p.formatted_address}</p>
        </div>
        <div className="text-right shrink-0">
          {p.rating != null && (
            <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
              <span className="text-amber-600 font-bold">{p.rating}</span>
              <span className="text-xs text-amber-600">★</span>
            </div>
          )}
          {p.user_rating_count != null && (
            <div className="text-xs text-gray-500 mt-1">
              {p.user_rating_count} avaliações
            </div>
          )}
        </div>
      </div>

      {/* Sentiment Score */}
      <div className={`bg-gradient-to-r ${sentimentColor} rounded-xl p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium opacity-90">Sentimento Geral</div>
            <div className="text-3xl font-bold mt-1">
              {ai.overall_sentiment_score?.toFixed(1) ?? "N/A"}
              <span className="text-xl">/10</span>
            </div>
          </div>
          <div className="text-5xl">{sentimentEmoji}</div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
            <span className="text-lg">💪</span> Pontos Fortes
          </h4>
          <ul className="space-y-1.5">
            {ai.strengths?.map((s: string, i: number) => (
              <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                <span className="text-green-500 shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
            <span className="text-lg">⚠️</span> Pontos Fracos
          </h4>
          <ul className="space-y-1.5">
            {ai.weaknesses?.map((w: string, i: number) => (
              <li key={i} className="text-sm text-red-900 flex items-start gap-2">
                <span className="text-red-500 shrink-0">✕</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
        <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
          <span className="text-lg">📋</span> Resumo Executivo
        </h4>
        <p className="text-sm text-gray-800 leading-relaxed">{ai.executive_summary}</p>
      </div>

      {/* Opportunities */}
      {ai.actionable_opportunities && ai.actionable_opportunities.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span> Oportunidades
          </h4>
          <ul className="space-y-1.5">
            {ai.actionable_opportunities.map((o: string, i: number) => (
              <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                <span className="text-blue-500 shrink-0">→</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Link to Google Maps */}
      {p.google_maps_uri && (
        <a
          href={p.google_maps_uri}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          Ver no Google Maps →
        </a>
      )}
    </div>
  );
}
