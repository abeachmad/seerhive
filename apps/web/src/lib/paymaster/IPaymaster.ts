export interface PaymasterResult {
  sponsored: boolean;
  hash?: string;
  message: string;
  provider?: string;
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

export interface IPaymaster {
  sponsorUserOperation(userOp: UserOperation): Promise<PaymasterResult>;
  isAvailable(): boolean;
  estimateGasSavings(userOp: UserOperation): Promise<string>;
  getProviderName(): string;
}