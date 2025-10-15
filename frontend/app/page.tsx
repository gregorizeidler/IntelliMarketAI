"use client";

import InputForm from "@/components/InputForm";
import Report from "@/components/Report";
import MapView from "@/components/Map";
import CompetitorCard from "@/components/CompetitorCard";
import ComparisonView from "@/components/ComparisonView";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function HomePage() {
  const { result, isLoading, comparisonMode, comparisonResults } = useAnalysisStore();

  return (
    <main className="min-h-screen">
      {/* Hero Header */}
      <header className="relative overflow-hidden py-12 mb-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-black">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
                IntelliMarket
              </span>
              <br />
              <span className="text-gray-800">Analyzer</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              🚀 Inteligência de Mercado Local Potencializada por IA
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full backdrop-blur">
                <span className="text-lg">🤖</span>
                <span className="font-medium">GPT-4o</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full backdrop-blur">
                <span className="text-lg">📍</span>
                <span className="font-medium">Google Places</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full backdrop-blur">
                <span className="text-lg">📊</span>
                <span className="font-medium">Análise em Tempo Real</span>
              </div>
            </div>

            {/* Botão Features Avançadas */}
            {(result || comparisonResults.length > 0) && (
              <div className="pt-4">
                <a
                  href="/advanced"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-glow hover:shadow-glow-lg transition-all transform hover:scale-105"
                >
                  <span className="text-xl">🔬</span>
                  <span>Features Avançadas</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs">NOVO</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-16">
        {/* Main Content */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Sidebar - Form */}
          <div className="lg:col-span-1 space-y-6">
            <InputForm />
            
            {/* Loading State */}
            {isLoading && (
              <div className="glass rounded-2xl p-6 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Processando...</p>
                    <p className="text-sm text-gray-600">Isso pode levar alguns segundos</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔍</span>
                    <span>Localizando concorrentes...</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">🤖</span>
                    <span>Analisando reviews com IA...</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">📊</span>
                    <span>Gerando relatório estratégico...</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Content - Results */}
          <div className="lg:col-span-2 space-y-6">
            {comparisonMode && comparisonResults.length > 0 ? (
              <ComparisonView results={comparisonResults} />
            ) : result ? (
              <>
                <Report aggregated={result.aggregated_report} />
                <MapView data={result} />
              </>
            ) : (
              <div className="glass rounded-2xl p-12 text-center shadow-xl">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Pronto para Começar?
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Configure seu tipo de negócio e endereço à esquerda para começar a análise
                  de mercado com inteligência artificial.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Competitors Section */}
        {!comparisonMode && result && result.competitors.length > 0 && (
          <section className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-4xl">🏪</span> Concorrentes Encontrados
              </h2>
              <div className="glass px-4 py-2 rounded-full">
                <span className="text-sm font-bold text-purple-600">
                  {result.competitors.length} encontrado{result.competitors.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {result.competitors.map((c: any) => (
                <CompetitorCard key={c.place.place_id} competitor={c} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State for Comparison Mode */}
        {comparisonMode && comparisonResults.length === 0 && !isLoading && (
          <div className="glass rounded-2xl p-12 text-center shadow-xl animate-fadeIn">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Modo Comparação Ativado
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Adicione múltiplas áreas e clique em "Comparar" para ver uma análise
              comparativa detalhada entre diferentes regiões.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 mt-16 border-t border-gray-200 bg-white/30 backdrop-blur">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            Desenvolvido com ❤️ usando{" "}
            <span className="font-semibold text-purple-600">Next.js</span>,{" "}
            <span className="font-semibold text-blue-600">FastAPI</span> e{" "}
            <span className="font-semibold text-green-600">OpenAI</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
