import { create } from 'zustand';
import { AnalysisResult } from '@/types/analysis';

interface AnalysisStore {
  companies: AnalysisResult[];
  addCompany: (company: AnalysisResult) => void;
  removeCompany: (ticker: string) => void;
  clearCompanies: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  companies: [],
  addCompany: (company) =>
    set((state) => {
      // Check if company already exists
      const exists = state.companies.some((c) => c.metadata.ticker === company.metadata.ticker);
      if (exists) {
        // Update existing company
        return {
          companies: state.companies.map((c) =>
            c.metadata.ticker === company.metadata.ticker ? company : c
          ),
        };
      }
      // Add new company
      return { companies: [...state.companies, company] };
    }),
  removeCompany: (ticker) =>
    set((state) => ({
      companies: state.companies.filter((c) => c.metadata.ticker !== ticker),
    })),
  clearCompanies: () => set({ companies: [] }),
})); 