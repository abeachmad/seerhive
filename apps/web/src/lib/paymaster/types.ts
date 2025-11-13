export type PaymasterProvider = 'pimlico' | 'particle';
export type RoutingMode = 'auto' | 'pimlico' | 'particle' | 'abtest';

export interface PaymasterResult {
  sponsored: boolean;
  hash?: string;
  message: string;
  provider: PaymasterProvider;
}

export interface UserOperation {
  sender: string;
  callData: string;
  callGasLimit?: string;
  verificationGasLimit?: string;
  preVerificationGas?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  value?: bigint;
}

export interface SponsorOptions {
  providerHint?: PaymasterProvider;
}

export interface Telemetry {
  provider_used: PaymasterProvider;
  route_mode: RoutingMode;
  simulate_ms: number;
  sponsor_ms: number;
  failover_hit: boolean;
  chainId: number;
}