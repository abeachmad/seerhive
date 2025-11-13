import { PaymasterResult, UserOperation, SponsorOptions } from './types';

export interface IPaymaster {
  sponsorUserOperation(userOp: UserOperation, opts?: SponsorOptions): Promise<PaymasterResult>;
  isAvailable(): boolean;
  estimateGasSavings(userOp: UserOperation): Promise<string>;
  getProviderName(): string;
}