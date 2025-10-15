"use client";

import { useState, useEffect } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import dynamic from "next/dynamic";

// Importação dinâmica para evitar SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function HeatMap({ data }: { data: any }) {
  const { result } = useAnalysisStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!result) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold mb-2">Heat Map de Saturação</h2>
        <p className="text-gray-600">Faça uma análise primeiro</p>
      </div>
    );
  }

  const centerLat = result?.center?.lat || -23.5505;
  const centerLng = result?.center?.lng || -46.6333;

  // Calcula intensidade baseada na rating e número de reviews
  const getIntensity = (competitor: any) => {
    const rating = competitor.place.rating || 3.0;
    const reviewCount = competitor.place.user_rating_count || 0;
    // Score de 0 a 1 baseado em rating e popularidade
    return Math.min((rating / 5) * (Math.log(reviewCount + 1) / 10), 1);
  };

  // Cor baseada na intensidade
  const getColor = (intensity: number) => {
    if (intensity > 0.7) return "#dc2626"; // Vermelho - Alta saturação
    if (intensity > 0.5) return "#f59e0b"; // Laranja - Média-alta
    if (intensity > 0.3) return "#eab308"; // Amarelo - Média
    return "#22c55e"; // Verde - Baixa saturação
  };

  // Tamanho do círculo baseado na intensidade
  const getRadius = (intensity: number) => {
    return 100 + intensity * 400; // 100 a 500 metros
  };

  const getOpacity = (intensity: number) => {
    return 0.3 + intensity * 0.4; // 0.3 a 0.7
  };

  // Estatísticas
  const avgRating =
    result?.competitors?.reduce((sum: number, c: any) => sum + (c.place.rating || 0), 0) /
      (result?.competitors?.length || 1) || 0;

  const totalReviews = result?.competitors?.reduce(
    (sum: number, c: any) => sum + (c.place.user_rating_count || 0),
    0
  );

  const highSaturationCount = result?.competitors?.filter(
    (c: any) => getIntensity(c) > 0.7
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">🗺️</div>
          <h2 className="text-2xl font-bold">Heat Map de Saturação</h2>
        </div>
        <p className="text-gray-600">
          Visualização da densidade e qualidade dos concorrentes na região
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {result?.competitors?.length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Concorrentes</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{avgRating.toFixed(1)}⭐</div>
          <div className="text-sm text-gray-600 mt-1">Rating Médio</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{totalReviews}</div>
          <div className="text-sm text-gray-600 mt-1">Total Reviews</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{highSaturationCount}</div>
          <div className="text-sm text-gray-600 mt-1">Alta Saturação</div>
        </div>
      </div>

      {/* Legenda */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold mb-4">Legenda</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Intensidade por Cor:</h4>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-600"></div>
              <span className="text-sm">Alta saturação (70-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-500"></div>
              <span className="text-sm">Média-alta (50-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Média (30-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500"></div>
              <span className="text-sm">Baixa saturação (0-30%)</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tamanho do Círculo:</h4>
            <p className="text-sm text-gray-600">
              Quanto maior o círculo, maior a influência do concorrente (baseado em rating e
              número de reviews)
            </p>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-4">Opacidade:</h4>
            <p className="text-sm text-gray-600">
              Áreas mais opacas indicam maior concentração de concorrentes bem estabelecidos
            </p>
          </div>
        </div>
      </div>

      {/* Mapa */}
      {isClient && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-4">Mapa de Calor</h3>
          <div className="h-[600px] rounded-xl overflow-hidden border-2 border-gray-200">
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Círculos de calor para cada concorrente */}
              {result?.competitors?.map((competitor: any, idx: number) => {
                const lat = competitor.place.location?.latitude;
                const lng = competitor.place.location?.longitude;
                if (!lat || !lng) return null;

                const intensity = getIntensity(competitor);
                const color = getColor(intensity);
                const radius = getRadius(intensity);
                const opacity = getOpacity(intensity);

                return (
                  <CircleMarker
                    key={idx}
                    center={[lat, lng]}
                    radius={Math.min(radius / 10, 50)} // Ajusta para visualização
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: opacity,
                      color: color,
                      weight: 2,
                      opacity: 0.8,
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-bold text-sm mb-1">
                          {competitor.place.display_name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {competitor.place.formatted_address}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div>⭐ Rating: {competitor.place.rating || "N/A"}</div>
                          <div>📝 Reviews: {competitor.place.user_rating_count || 0}</div>
                          <div>
                            📊 Intensidade: {(intensity * 100).toFixed(0)}%
                          </div>
                          <div>
                            💭 Sentimento: {competitor.analysis?.sentiment_score?.toFixed(1) || "N/A"}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Marcador central */}
              <CircleMarker
                center={[centerLat, centerLng]}
                radius={8}
                pathOptions={{
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                  color: "white",
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold text-sm">📍 Centro da Busca</h4>
                    <p className="text-xs text-gray-600">Ponto de referência da análise</p>
                  </div>
                </Popup>
              </CircleMarker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="glass rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>💡</span>
          <span>Insights de Saturação</span>
        </h3>
        <div className="space-y-3">
          {highSaturationCount > result?.competitors?.length / 2 && (
            <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg">
              <span className="text-red-600 font-bold">⚠️</span>
              <p className="text-gray-700 text-sm">
                <strong>Alta concentração de concorrentes fortes:</strong> {highSaturationCount} de{" "}
                {result?.competitors?.length} estabelecimentos têm alta intensidade. Considere
                diferenciais significativos.
              </p>
            </div>
          )}

          {avgRating > 4.0 && (
            <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg">
              <span className="text-yellow-600 font-bold">⭐</span>
              <p className="text-gray-700 text-sm">
                <strong>Alto padrão de qualidade:</strong> Rating médio de {avgRating.toFixed(1)}{" "}
                indica mercado maduro. Foque em excelência operacional.
              </p>
            </div>
          )}

          {result?.saturation_percentage > 70 && (
            <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg">
              <span className="text-orange-600 font-bold">🔥</span>
              <p className="text-gray-700 text-sm">
                <strong>Mercado saturado:</strong> {result.saturation_percentage.toFixed(0)}% de
                saturação. Busque nichos ou localizações alternativas.
              </p>
            </div>
          )}

          {result?.saturation_percentage < 40 && (
            <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg">
              <span className="text-green-600 font-bold">✅</span>
              <p className="text-gray-700 text-sm">
                <strong>Oportunidade identificada:</strong> Apenas{" "}
                {result.saturation_percentage.toFixed(0)}% de saturação. Mercado com espaço para
                novos players.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

