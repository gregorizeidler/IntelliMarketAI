"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { analyzeMarket } from "@/lib/api";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import PlacesAutocomplete from "./PlacesAutocomplete";

type AreaInput = {
  id: string;
  name: string;
  address: string;
  placeId?: string;
};

export default function InputForm() {
  const {
    setResult,
    isLoading,
    setIsLoading,
    comparisonMode,
    setComparisonMode,
    addComparisonResult,
    clearComparison,
    comparisonResults,
  } = useAnalysisStore();

  const [businessType, setBusinessType] = useState("café artesanal");
  const [areas, setAreas] = useState<AreaInput[]>([
    {
      id: "1",
      name: "Área 1",
      address: "Avenida Paulista, 1000, São Paulo, SP",
    },
  ]);
  const [radius, setRadius] = useState(2000);

  const mutate = useMutation({
    mutationFn: analyzeMarket,
    onError: (err) => {
      console.error(err);
      alert("Falha ao analisar mercado. Verifique endereço e suas chaves de API.");
      setIsLoading(false);
    },
  });

  const handleAnalyze = async () => {
    if (comparisonMode) {
      // Modo comparação: processar todas as áreas sequencialmente
      setIsLoading(true);
      clearComparison();
      
      try {
        for (const area of areas) {
          if (!area.address.trim()) continue;
          
          const result = await analyzeMarket({
            business_type: businessType,
            address: area.address,
            radius,
          });
          
          addComparisonResult(result);
        }
      } catch (error) {
        console.error("Erro ao processar comparação:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Modo simples: processar apenas primeira área
      setIsLoading(true);
      try {
        const result = await analyzeMarket({
          business_type: businessType,
          address: areas[0].address,
          radius,
        });
        setResult(result);
      } catch (error) {
        console.error("Erro ao analisar:", error);
        alert("Falha ao analisar mercado. Verifique endereço e suas chaves de API.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addArea = () => {
    setAreas([
      ...areas,
      { id: Date.now().toString(), name: `Área ${areas.length + 1}`, address: "" },
    ]);
  };

  const removeArea = (id: string) => {
    setAreas(areas.filter((a) => a.id !== id));
  };

  const updateArea = (id: string, address: string, placeId?: string) => {
    setAreas(areas.map((a) => (a.id === id ? { ...a, address, placeId } : a)));
  };

  const toggleComparisonMode = () => {
    const newMode = !comparisonMode;
    setComparisonMode(newMode);
    if (!newMode) {
      setAreas([areas[0]]);
      clearComparison();
    }
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-6 shadow-xl card-hover">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Configuração
        </h2>
        <button
          onClick={toggleComparisonMode}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            comparisonMode
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {comparisonMode ? "✓ Comparar Áreas" : "Modo Simples"}
        </button>
      </div>

      {/* Business Type */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          🏢 Tipo de negócio
        </label>
        <input
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          className="w-full rounded-xl px-4 py-3 border-2 border-purple-200 focus:border-purple-500 focus:outline-none input-focus transition-all bg-white/80"
          placeholder='Ex.: "café artesanal", "barbearia", "pizzaria"'
        />
      </div>

      {/* Areas */}
      <div className="space-y-4">
        {areas.map((area, idx) => (
          <div key={area.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                📍 {area.name}
              </label>
              {comparisonMode && areas.length > 1 && (
                <button
                  onClick={() => removeArea(area.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  ✕ Remover
                </button>
              )}
            </div>
            <PlacesAutocomplete
              value={area.address}
              onChange={(value, placeId) => updateArea(area.id, value, placeId)}
              placeholder="Digite um endereço..."
            />
          </div>
        ))}

        {comparisonMode && areas.length < 5 && (
          <button
            onClick={addArea}
            className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-medium hover:bg-purple-50 transition-colors"
          >
            + Adicionar Área para Comparar
          </button>
        )}
      </div>

      {/* Radius */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          🎯 Raio de busca: <span className="text-purple-600">{radius}m</span>
        </label>
        <input
          type="range"
          value={radius}
          min={100}
          max={50000}
          step={100}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>100m</span>
          <span>50km</span>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {comparisonMode ? `Analisando (${comparisonResults.length}/${areas.filter(a => a.address.trim()).length})...` : "Analisando..."}
          </span>
        ) : comparisonMode ? (
          `🔍 Comparar ${areas.filter(a => a.address.trim()).length} Área${areas.filter(a => a.address.trim()).length !== 1 ? "s" : ""}`
        ) : (
          "🔍 Analisar Mercado"
        )}
      </button>

      {/* Info */}
      {comparisonMode && comparisonResults.length > 0 && !isLoading && (
        <div className="text-sm text-center text-gray-600 bg-green-50 py-2 rounded-lg border border-green-200">
          ✓ {comparisonResults.length} área{comparisonResults.length > 1 ? "s" : ""}{" "}
          analisada{comparisonResults.length > 1 ? "s" : ""} com sucesso
        </div>
      )}
    </div>
  );
}
