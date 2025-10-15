"use client";

import { useState } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import Link from "next/link";

// Components para cada feature
import SentimentByAspect from "@/components/advanced/SentimentByAspect";
import CustomerPersona from "@/components/advanced/CustomerPersona";
import TicketEstimate from "@/components/advanced/TicketEstimate";
import PeakHours from "@/components/advanced/PeakHours";
import StreetViewGallery from "@/components/advanced/StreetViewGallery";
import LocationRecommendation from "@/components/advanced/LocationRecommendation";
import VisualConcept from "@/components/advanced/VisualConcept";
import TemporalAnalysis from "@/components/advanced/TemporalAnalysis";
import PhotoAnalysis from "@/components/advanced/PhotoAnalysis";
import HeatMap from "@/components/advanced/HeatMap";

type Tab = "sentiment" | "persona" | "ticket" | "hours" | "streetview" | "location" | "concept" | "temporal" | "photos" | "heatmap";

export default function AdvancedFeaturesPage() {
  const { result, comparisonResults } = useAnalysisStore();
  const [activeTab, setActiveTab] = useState<Tab>("sentiment");

  const hasData = result || comparisonResults.length > 0;

  if (!hasData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-12 max-w-2xl text-center shadow-xl">
          <div className="text-6xl mb-4">🔬</div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Features Avançadas
          </h1>
          <p className="text-gray-600 mb-6">
            Para acessar as features avançadas, você precisa primeiro fazer uma análise.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            ← Voltar para Análise
          </Link>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "sentiment" as Tab, icon: "🧠", label: "Sentiment por Aspecto" },
    { id: "persona" as Tab, icon: "👥", label: "Persona do Cliente" },
    { id: "ticket" as Tab, icon: "💰", label: "Ticket Médio" },
    { id: "hours" as Tab, icon: "🕐", label: "Horários de Pico" },
    { id: "streetview" as Tab, icon: "📸", label: "Street View" },
    { id: "location" as Tab, icon: "🎯", label: "Localização Ideal" },
    { id: "concept" as Tab, icon: "🎨", label: "Conceito Visual" },
    { id: "temporal" as Tab, icon: "📈", label: "Análise Temporal" },
    { id: "photos" as Tab, icon: "🖼️", label: "Fotos (Vision)" },
    { id: "heatmap" as Tab, icon: "🗺️", label: "Heat Map" },
  ];

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <header className="relative overflow-hidden py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                🔬 Features Avançadas
              </h1>
              <p className="text-gray-600 mt-2">
                Análises profundas com Inteligência Artificial
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white/60 backdrop-blur rounded-lg hover:bg-white/80 transition-all"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        {/* Tabs */}
        <div className="glass rounded-2xl p-2 mb-8 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow"
                    : "bg-white/50 hover:bg-white/80 text-gray-700"
                }`}
              >
                <div className="text-2xl mb-1">{tab.icon}</div>
                <div className="text-xs lg:text-sm">{tab.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="animate-fadeIn">
          {activeTab === "sentiment" && <SentimentByAspect data={result} />}
          {activeTab === "persona" && <CustomerPersona data={result} />}
          {activeTab === "ticket" && <TicketEstimate data={result} />}
          {activeTab === "hours" && <PeakHours data={result} />}
          {activeTab === "streetview" && <StreetViewGallery data={result} />}
          {activeTab === "location" && (
            <LocationRecommendation
              singleResult={result}
              comparisonResults={comparisonResults}
            />
          )}
          {activeTab === "concept" && <VisualConcept data={result} />}
          {activeTab === "temporal" && <TemporalAnalysis data={result} />}
          {activeTab === "photos" && <PhotoAnalysis data={result} />}
          {activeTab === "heatmap" && <HeatMap data={result} />}
        </div>
      </div>
    </main>
  );
}

