"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

const RL = {
  MapContainer: dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false }),
  TileLayer: dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false }),
  Marker: dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false }),
  Popup: dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false }),
  Circle: dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false })
};

function scoreToColor(score?: number) {
  if (score == null) return "#6366f1";
  if (score >= 8) return "#16a34a";
  if (score >= 6) return "#22c55e";
  if (score >= 4) return "#f59e0b";
  return "#ef4444";
}

function createDivIcon(color: string) {
  // Dynamically import leaflet only on client side
  if (typeof window === "undefined") return null;
  
  const L = require("leaflet");
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 1px ${color}"></div>`,
    iconSize: [14, 14],
  });
}

export default function MapView({ data }: { data: any }) {
  const center: LatLngExpression = useMemo(
    () => [data.center.latitude, data.center.longitude],
    [data.center.latitude, data.center.longitude]
  );

  return (
    <div className="rounded border bg-white overflow-hidden">
      <RL.MapContainer center={center} zoom={14} style={{ height: 420, width: "100%" }}>
        <RL.TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RL.Circle center={center} radius={data.radius} pathOptions={{ color: "#0284C7" }} />
        <RL.Marker position={center} icon={createDivIcon("#0284C7")}>
          <RL.Popup>Ponto de referência da análise</RL.Popup>
        </RL.Marker>

        {data.competitors.map((c: any) => {
          const p = c.place;
          const s = (c.ai?.overall_sentiment_score ?? null) as number | null;
          const pos: LatLngExpression = [p.location.latitude, p.location.longitude];
          const color = scoreToColor(s ?? undefined);
          return (
            <RL.Marker key={p.place_id} position={pos} icon={createDivIcon(color)}>
              <RL.Popup>
                <div className="space-y-1">
                  <div className="font-medium">{p.display_name}</div>
                  {p.rating != null && (
                    <div className="text-sm text-slate-600">
                      Google: {p.rating} ({p.user_rating_count})
                    </div>
                  )}
                  <p className="text-sm">{c.ai?.executive_summary}</p>
                  {p.google_maps_uri && (
                    <a className="text-brand-700 text-sm underline" href={p.google_maps_uri} target="_blank">Abrir no Google Maps</a>
                  )}
                </div>
              </RL.Popup>
            </RL.Marker>
          );
        })}
      </RL.MapContainer>
    </div>
  );
}
