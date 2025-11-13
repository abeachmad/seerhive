export const DEMO = process.env.NEXT_PUBLIC_DEMO === '1';

export function isDemo(): boolean {
  return DEMO;
}

export function disableWS(): boolean {
  return DEMO;
}