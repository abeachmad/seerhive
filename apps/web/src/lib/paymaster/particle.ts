export class ParticlePaymaster {
  private url: string;
  private projectId: string;
  private clientKey: string;

  constructor(url: string, projectId: string, clientKey: string) {
    this.url = url;
    this.projectId = projectId;
    this.clientKey = clientKey;
  }

  async sponsorUserOperation(userOp: any, entryPoint: string) {
    const response = await fetch(
      `${this.url}?projectUuid=${this.projectId}&projectKey=${this.clientKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'pm_sponsorUserOperation',
          params: [userOp, entryPoint],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Particle paymaster failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Particle paymaster error');
    }

    return data.result;
  }
}
