import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AnalysisResult = any; // TODO: type properly

type State = {
  result: AnalysisResult | null;
  comparisonResults: AnalysisResult[];
  isLoading: boolean;
  comparisonMode: boolean;
  setResult: (r: AnalysisResult | null) => void;
  setComparisonResults: (results: AnalysisResult[]) => void;
  addComparisonResult: (result: AnalysisResult) => void;
  clearComparison: () => void;
  setIsLoading: (b: boolean) => void;
  setComparisonMode: (b: boolean) => void;
};

export const useAnalysisStore = create<State>()(
  persist(
    (set) => ({
      result: null,
      comparisonResults: [],
      isLoading: false,
      comparisonMode: false,
      setResult: (r) => set({ result: r }),
      setComparisonResults: (results) => set({ comparisonResults: results }),
      addComparisonResult: (result) =>
        set((state) => ({
          comparisonResults: [...state.comparisonResults, result],
        })),
      clearComparison: () => set({ comparisonResults: [] }),
      setIsLoading: (b) => set({ isLoading: b }),
      setComparisonMode: (b) => set({ comparisonMode: b }),
    }),
    {
      name: "analysis-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
