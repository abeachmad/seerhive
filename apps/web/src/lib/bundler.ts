import type { UserOperation } from 'permissionless';

const PARTICLE_BUNDLER_URL = 'https://bundler.particle.network';

export async function sendUserOperation(
  userOp: UserOperation,
  entryPoint: string,
  chainId: number
) {
  const response = await fetch(`${PARTICLE_BUNDLER_URL}/${chainId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      chainId,
      method: 'eth_sendUserOperation',
      params: [userOp, entryPoint],
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'Bundler error');
  }

  return data.result;
}

export async function getUserOperationReceipt(userOpHash: string, chainId: number) {
  const response = await fetch(`${PARTICLE_BUNDLER_URL}/${chainId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      chainId,
      method: 'eth_getUserOperationReceipt',
      params: [userOpHash],
    }),
  });

  const data = await response.json();
  return data.result;
}

export async function getSupportedEntryPoints(chainId: number) {
  const response = await fetch(`${PARTICLE_BUNDLER_URL}/${chainId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      chainId,
      method: 'eth_supportedEntryPoints',
      params: [],
    }),
  });

  const data = await response.json();
  return data.result;
}
