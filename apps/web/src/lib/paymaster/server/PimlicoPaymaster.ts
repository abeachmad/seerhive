// Server-side Pimlico paymaster adapter
export class PimlicoPaymaster {
  constructor(private url: string) {}

  async sponsor(userOp: any, entryPoint: string, chainId: number) {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        params: [userOp, { entryPoint }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Pimlico sponsor failed: ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(`Pimlico error: ${data.error.message}`);
    }

    return {
      paymasterAndData: data.result.paymasterAndData,
      preVerificationGas: data.result.preVerificationGas,
      verificationGasLimit: data.result.verificationGasLimit,
      callGasLimit: data.result.callGasLimit,
    };
  }
}
