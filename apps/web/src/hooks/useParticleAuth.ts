'use client';

export function useParticleAuth() {
  return { 
    connect: async () => {}, 
    disconnect: async () => {}, 
    connected: false, 
    userInfo: null 
  };
}
