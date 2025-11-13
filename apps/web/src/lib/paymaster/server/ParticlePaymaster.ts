// Server-side Particle paymaster adapter
export class ParticlePaymaster {
  constructor(
    private url: string,
    private projectId: string,
    private clientKey: string
  ) {}

  async sponsor(userOp: any, entryPoint: string, chainId: number) {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Particle-Project-Id': this.projectId,
        'X-Particle-Client-Key': this.clientKey,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        params: [userOp, entryPoint, chainId],
      }),
    });

    if (!res.ok) {
      throw new Error(`Particle sponsor failed: ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(`Particle error: ${data.error.message}`);
    }

    return {
      paymasterAndData: data.result.paymasterAndData,
      preVerificationGas: data.result.preVerificationGas,
      verificationGasLimit: data.result.verificationGasLimit,
      callGasLimit: data.result.callGasLimit,
    };
  }
}
