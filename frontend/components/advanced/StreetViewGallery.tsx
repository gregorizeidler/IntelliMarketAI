"use client";

import { useState } from "react";
import Image from "next/image";

export default function StreetViewGallery({ data }: { data: any }) {
  if (!data || !data.competitors) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-gray-600">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">📸 Street View dos Concorrentes</h2>
        <p className="text-gray-600">
          Visualize as fachadas dos estabelecimentos concorrentes
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.competitors.map((competitor: any, idx: number) => {
          const lat = competitor.place.location.latitude;
          const lng = competitor.place.location.longitude;
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          
          // URL do Street View usando coordenadas
          const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&key=${apiKey}&fov=90&heading=0&pitch=0`;
          
          // URL de fallback: mapa estático
          const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=600x400&markers=color:red%7C${lat},${lng}&key=${apiKey}`;

          return (
            <div
              key={idx}
              className="glass rounded-2xl overflow-hidden shadow-lg card-hover"
            >
              <div className="relative h-48 bg-gray-200">
                <img
                  src={streetViewUrl}
                  alt={competitor.place.display_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Se Street View falhar, tenta o mapa estático
                    e.currentTarget.src = staticMapUrl;
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">
                  {competitor.place.display_name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {competitor.place.formatted_address}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {competitor.place.rating && (
                      <span className="text-sm bg-amber-100 px-2 py-1 rounded">
                        ⭐ {competitor.place.rating}
                      </span>
                    )}
                    <span className="text-sm bg-purple-100 px-2 py-1 rounded">
                      😊 {competitor.ai.overall_sentiment_score.toFixed(1)}
                    </span>
                  </div>
                  <a
                    href={competitor.place.google_maps_uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver no Maps →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Dicas de Análise Visual
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Compare as fachadas dos concorrentes mais bem avaliados</li>
          <li>✓ Observe o estado de conservação dos estabelecimentos</li>
          <li>✓ Identifique padrões visuais que se repetem</li>
          <li>✓ Veja a movimentação ao redor dos locais</li>
          <li>✓ Analise a vizinhança e acessibilidade</li>
        </ul>
      </div>
    </div>
  );
}

