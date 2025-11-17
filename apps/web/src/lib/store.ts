import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  resolutionProposal?: {
    outcome: boolean;
    proposedAt: string;
    proposer: string;
    challengeDeadline: string;
    challenged: boolean;
  };
}

interface Trade {
  id: string;
  marketId: string;
  amount: number;
  side: 'yes' | 'no';
  timestamp: string;
  user: string;
  prediction: number;
  outcome?: boolean;
  txHash?: string; // Add transaction hash
}

interface UserReputation {
  address: string;
  brierScore: number;
  elo: number;
  accuracy: number;
  totalVolume: number;
  totalTrades: number;
  reputationScore: number;
  predictions: Trade[];
}

interface Store {
  markets: Market[];
  trades: Trade[];
  userReputations: Record<string, UserReputation>;
  
  addMarket: (market: Market) => void;
  addTrade: (trade: Trade) => void;
  updateMarket: (id: string, updates: Partial<Market>) => void;
  proposeResolution: (marketId: string, outcome: boolean, proposer: string) => void;
  challengeResolution: (marketId: string) => void;
  updateUserReputation: (address: string, trade: Trade, outcome?: boolean) => void;
  getUserReputation: (address: string) => UserReputation | undefined;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      markets: [],
      trades: [],
      userReputations: {},
      
      addMarket: (market) => set((state) => ({ 
        markets: [...state.markets, market] 
      })),
      
      addTrade: (trade) => {
        console.log('💾 STORE: Adding trade:', trade);
        set((state) => {
          const newTrades = [...state.trades, trade];
          console.log('💾 STORE: New trades array:', newTrades);
          return { trades: newTrades };
        });
      },
      
      updateMarket: (id, updates) => set((state) => ({
        markets: state.markets.map(m => m.id === id ? { ...m, ...updates } : m)
      })),
      
      proposeResolution: (marketId, outcome, proposer) => set((state) => ({
        markets: state.markets.map(m => 
          m.id === marketId 
            ? {
                ...m,
                resolutionProposal: {
                  outcome,
                  proposedAt: new Date().toISOString(),
                  proposer,
                  challengeDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  challenged: false,
                }
              }
            : m
        )
      })),
      
      challengeResolution: (marketId) => set((state) => ({
        markets: state.markets.map(m =>
          m.id === marketId && m.resolutionProposal
            ? {
                ...m,
                resolutionProposal: {
                  ...m.resolutionProposal,
                  challenged: true,
                }
              }
            : m
        )
      })),
      
      updateUserReputation: (address, trade, outcome) => set((state) => {
        const current = state.userReputations[address] || {
          address,
          brierScore: 0,
          elo: 1500,
          accuracy: 0,
          totalVolume: 0,
          totalTrades: 0,
          reputationScore: 50,
          predictions: [],
        };
        
        const newPredictions = [...current.predictions, trade];
        const totalVolume = current.totalVolume + trade.amount;
        
        return {
          userReputations: {
            ...state.userReputations,
            [address]: {
              ...current,
              totalVolume,
              totalTrades: current.totalTrades + 1,
              predictions: newPredictions,
            }
          }
        };
      }),
      
      getUserReputation: (address) => get().userReputations[address],
    }),
    {
      name: 'seerhive-storage',
    }
  )
);