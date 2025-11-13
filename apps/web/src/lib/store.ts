import { create } from 'zustand';

interface Market {
  id: string;
  question: string;
  totalVolume: number;
  yesPrice: number;
  noPrice: number;
  endDate: string;
  status: string;
  sparkline: { value: number }[];
  description?: string;
  category?: string;
  aiVerified?: boolean;
  aiConfidence?: number;
}

interface Trade {
  id: string;
  marketId: string;
  amount: number;
  side: 'yes' | 'no';
  timestamp: string;
}

interface Store {
  markets: Market[];
  trades: Trade[];
  addMarket: (market: Market) => void;
  addTrade: (trade: Trade) => void;
  updateMarket: (id: string, updates: Partial<Market>) => void;
}

export const useStore = create<Store>((set) => ({
  markets: [],
  trades: [],
  addMarket: (market) => set((state) => ({ markets: [...state.markets, market] })),
  addTrade: (trade) => set((state) => ({ trades: [...state.trades, trade] })),
  updateMarket: (id, updates) => set((state) => ({
    markets: state.markets.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
}));