import type { UserOperation } from 'permissionless';

const PARTICLE_PAYMASTER_URL = 'https://paymaster.particle.network';
const PARTICLE_PROJECT_UUID = process.env.PARTICLE_PROJECT_ID!;
const PARTICLE_PROJECT_KEY = process.env.PARTICLE_CLIENT_KEY!;

export async function sponsorUserOperation(
  userOp: Partial<UserOperation>,
  entryPoint: string,
  chainId: number
) {
  const response = await fetch(
    `${PARTICLE_PAYMASTER_URL}?projectUuid=${PARTICLE_PROJECT_UUID}&projectKey=${PARTICLE_PROJECT_KEY}`,
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
    throw new Error(data.error.message || 'Paymaster error');
  }

  return data.result;
}

export async function getPaymasterBalance(chainId: number) {
  const response = await fetch(
    `${PARTICLE_PAYMASTER_URL}?projectUuid=${PARTICLE_PROJECT_UUID}&projectKey=${PARTICLE_PROJECT_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'pm_paymasterBalance',
        params: [],
      }),
    }
  );

  const data = await response.json();
  return data.result;
}
