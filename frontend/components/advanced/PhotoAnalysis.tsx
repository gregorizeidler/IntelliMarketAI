"use client";

import { useState } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function PhotoAnalysis({ data }: { data: any }) {
  const { result } = useAnalysisStore();
  const [photoData, setPhotoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Coleta URLs de fotos dos concorrentes
      const imageUrls: string[] = [];
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      result?.competitors?.forEach((competitor: any) => {
        const lat = competitor.place.location?.latitude;
        const lng = competitor.place.location?.longitude;
        
        if (lat && lng) {
          // Usa Street View como fonte de imagens
          const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&key=${apiKey}&fov=90`;
          imageUrls.push(streetViewUrl);
        }
      });

      if (imageUrls.length === 0) {
        setError("Nenhuma foto disponível para análise");
        setLoading(false);
        return;
      }

      // Limita a 5 fotos (para não gastar muito crédito)
      const limitedUrls = imageUrls.slice(0, 5);

      const response = await fetch("http://localhost:8000/api/advanced/photo-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_urls: limitedUrls,
          business_type: result?.request?.business_type || "estabelecimento",
        }),
      });
      const analysisData = await response.json();
      setPhotoData(analysisData.data || analysisData);
    } catch (err) {
      setError("Erro ao analisar fotos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">📸</div>
        <h2 className="text-2xl font-bold mb-2">Análise de Fotos com IA</h2>
        <p className="text-gray-600">Faça uma análise primeiro</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">📸</div>
          <h2 className="text-2xl font-bold">Análise de Fotos com GPT-4 Vision</h2>
        </div>
        <p className="text-gray-600">
          Análise visual das fachadas e ambientes dos concorrentes
        </p>
      </div>

      {/* Analyze Button */}
      {!photoData && (
        <div className="glass rounded-2xl p-8 text-center">
          <button
            onClick={analyzePhotos}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white rounded-xl font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Analisando Fotos... (pode levar até 30s)
              </span>
            ) : (
              <span>🔍 Analisar Fotos com IA</span>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Análise de até 5 fotos com GPT-4 Vision (~$0.01 por foto)
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
      {photoData && (
        <>
          {/* Raw Analysis (caso não seja JSON estruturado) */}
          {photoData.raw_analysis && !photoData.estilo_decoracao && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎨</span>
                <span>Análise Visual</span>
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {photoData.raw_analysis}
                </p>
              </div>
            </div>
          )}

          {/* Estilo de Decoração */}
          {photoData.estilo_decoracao && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎨</span>
                <span>Estilo de Decoração</span>
              </h3>
              <p className="text-lg text-gray-700">{photoData.estilo_decoracao}</p>
            </div>
          )}

          {/* Esquema de Cores */}
          {photoData.esquema_cores && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎨</span>
                <span>Esquema de Cores</span>
              </h3>
              <p className="text-lg text-gray-700">{photoData.esquema_cores}</p>
            </div>
          )}

          {/* Tamanho do Espaço */}
          {photoData.tamanho_espaco && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📐</span>
                <span>Tamanho do Espaço</span>
              </h3>
              <p className="text-lg text-gray-700">{photoData.tamanho_espaco}</p>
            </div>
          )}

          {/* Nível de Movimento */}
          {photoData.nivel_movimento && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>👥</span>
                <span>Nível de Movimento</span>
              </h3>
              <p className="text-lg text-gray-700">{photoData.nivel_movimento}</p>
            </div>
          )}

          {/* Estado de Conservação */}
          {photoData.estado_conservacao && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔧</span>
                <span>Estado de Conservação</span>
              </h3>
              <p className="text-lg text-gray-700">{photoData.estado_conservacao}</p>
            </div>
          )}

          {/* Diferenciais Visuais */}
          {photoData.diferenciais_visuais && Array.isArray(photoData.diferenciais_visuais) && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⭐</span>
                <span>Diferenciais Visuais</span>
              </h3>
              <ul className="space-y-2">
                {photoData.diferenciais_visuais.map((diferencial: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span className="text-gray-700">{diferencial}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pontos Fortes */}
          {photoData.pontos_fortes && Array.isArray(photoData.pontos_fortes) && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>👍</span>
                <span>Pontos Fortes do Design</span>
              </h3>
              <ul className="space-y-2">
                {photoData.pontos_fortes.map((ponto: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg">
                    <span className="text-green-600 font-bold">+</span>
                    <span className="text-gray-700">{ponto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pontos Fracos */}
          {photoData.pontos_fracos && Array.isArray(photoData.pontos_fracos) && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>👎</span>
                <span>Pontos Fracos do Design</span>
              </h3>
              <ul className="space-y-2">
                {photoData.pontos_fracos.map((ponto: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 bg-red-50 p-3 rounded-lg">
                    <span className="text-red-600 font-bold">−</span>
                    <span className="text-gray-700">{ponto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botão para Nova Análise */}
          <div className="glass rounded-2xl p-6 text-center">
            <button
              onClick={() => setPhotoData(null)}
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

