"use client";

import { useState } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function VisualConcept({ data }: { data: any }) {
  const { result } = useAnalysisStore();
  const [concept, setConcept] = useState<any>(null);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateConcept = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/advanced/visual-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_type: result?.request?.business_type || "restaurante",
          market_analysis: {
            saturation: result?.saturation_percentage || 50,
            top_competitors: result?.competitors?.slice(0, 3).map((c: any) => c.place.display_name) || [],
            avg_rating: result?.competitors?.[0]?.analysis?.sentiment_score || 4.0,
          },
          persona: {
            target: "Cliente ideal para " + (result?.request?.business_type || "estabelecimento"),
            needs: result?.aggregated_report?.market_gaps?.slice(0, 3) || ["Qualidade", "Atendimento", "Localização"],
          },
          best_practices: result?.aggregated_report?.market_strengths || [
            "Atendimento de qualidade",
            "Ambiente agradável",
            "Produtos frescos",
          ],
        }),
      });
      const conceptData = await response.json();
      setConcept(conceptData.data || conceptData);
    } catch (err) {
      setError("Erro ao gerar conceito visual");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!concept?.prompt_dalle) return;
    
    setGeneratingImage(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/advanced/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: concept.prompt_dalle,
        }),
      });
      const imageData = await response.json();
      setMockupUrl(imageData.image_url);
    } catch (err) {
      setError("Erro ao gerar imagem com DALL-E 3");
      console.error(err);
    } finally {
      setGeneratingImage(false);
    }
  };

  if (!result) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="text-2xl font-bold mb-2">Conceito Visual com IA</h2>
        <p className="text-gray-600">Faça uma análise primeiro para gerar conceitos visuais</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">🎨</div>
          <h2 className="text-2xl font-bold">Conceito Visual com IA</h2>
        </div>
        <p className="text-gray-600">
          Geração de mockups e identidade visual com DALL-E 3
        </p>
      </div>

      {/* Generate Concept Button */}
      {!concept && (
        <div className="glass rounded-2xl p-8 text-center">
          <button
            onClick={generateConcept}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-xl font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Gerando Conceito...
              </span>
            ) : (
              <span>✨ Gerar Conceito Visual</span>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Powered by GPT-4o + DALL-E 3
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass rounded-2xl p-4 border-2 border-red-500/50 bg-red-50">
          <p className="text-red-700 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Concept Details */}
      {concept && (
        <>
          {/* Conceito Principal */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💡</span>
              <span>Conceito Principal</span>
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {concept.conceito_principal}
            </p>
          </div>

          {/* Elementos Visuais */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🎨</span>
              <span>Elementos Visuais</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Esquema de Cores</h4>
                <p className="text-gray-600">{concept.elementos_visuais?.esquema_cores}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Estilo de Design</h4>
                <p className="text-gray-600">{concept.elementos_visuais?.estilo_design}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Iluminação</h4>
                <p className="text-gray-600">{concept.elementos_visuais?.iluminacao}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Materiais</h4>
                <div className="flex flex-wrap gap-2">
                  {concept.elementos_visuais?.materiais?.map((material: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Layout */}
          {concept.layout && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📐</span>
                <span>Layout e Distribuição</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Área Total Estimada</h4>
                  <p className="text-gray-600">{concept.layout.area_total_estimada}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Distribuição</h4>
                  <p className="text-gray-600">{concept.layout.distribuicao}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Capacidade</h4>
                  <p className="text-gray-600">{concept.layout.capacidade}</p>
                </div>
              </div>
            </div>
          )}

          {/* Diferenciais */}
          {concept.diferenciais && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⭐</span>
                <span>Diferenciais</span>
              </h3>
              <ul className="space-y-2">
                {concept.diferenciais.map((diferencial: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{diferencial}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* DALL-E Prompt */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🤖</span>
              <span>Prompt para DALL-E 3</span>
            </h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
              {concept.prompt_dalle}
            </div>
          </div>

          {/* Generate Image Button */}
          {!mockupUrl && (
            <div className="glass rounded-2xl p-8 text-center">
              <button
                onClick={generateImage}
                disabled={generatingImage}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 text-white rounded-xl font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingImage ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Gerando Imagem... (pode levar até 30s)
                  </span>
                ) : (
                  <span>🎨 Gerar Mockup com DALL-E 3</span>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Isto consome créditos da API OpenAI (~$0.04 por imagem)
              </p>
            </div>
          )}

          {/* Generated Mockup */}
          {mockupUrl && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🖼️</span>
                <span>Mockup Gerado</span>
              </h3>
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={mockupUrl}
                  alt="Mockup gerado com DALL-E 3"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href={mockupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition"
                >
                  🔗 Abrir em Nova Aba
                </a>
                <a
                  href={mockupUrl}
                  download="mockup.png"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-center hover:bg-green-700 transition"
                >
                  💾 Baixar Imagem
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

