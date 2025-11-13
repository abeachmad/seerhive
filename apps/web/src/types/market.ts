export interface Market {
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