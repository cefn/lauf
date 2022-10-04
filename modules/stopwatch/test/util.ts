/** Pulls all the content from a generator and serves it as an array.
 * Do not attempt this with an infinite generator
 */
export async function fromAsync<T>(gen: AsyncGenerator<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of gen) {
    out.push(x);
  }
  return out;
}
