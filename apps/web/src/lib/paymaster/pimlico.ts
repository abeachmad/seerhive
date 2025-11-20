export class PimlicoPaymaster {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async sponsorUserOperation(userOp: any, entryPoint: string) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        params: [userOp, entryPoint, { sponsorshipPolicyId: 'sp_cheerful_thing' }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Pimlico paymaster failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Pimlico paymaster error');
    }

    return data.result;
  }
}
