export function promiseDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomInteger(bound: number): number {
  return Math.floor(Math.random() * bound);
}
