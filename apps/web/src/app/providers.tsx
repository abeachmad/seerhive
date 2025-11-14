'use client';
import { ParticleConnectKit } from '@/components/ConnectKit';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ParticleConnectKit>{children}</ParticleConnectKit>;
}