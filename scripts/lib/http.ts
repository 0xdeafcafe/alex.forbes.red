// HTTP helpers shared across the source fetchers.

export async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) {
    const body = (await r.text()).slice(0, 200);
    throw new Error(`${url} -> ${r.status} ${r.statusText}: ${body}`);
  }
  return r.json() as Promise<T>;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
