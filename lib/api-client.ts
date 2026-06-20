export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = RequestInit & { retries?: number };

async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { retries = 0, ...init } = options;
  let lastError: Error = new Error("Request failed");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new ApiError(res.status, body.error ?? "Request failed", body.details);
      }
      return res;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (e instanceof ApiError && e.status < 500) throw e;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

export const api = {
  async get<T>(url: string): Promise<T> {
    const res = await fetchWithRetry(url, { retries: 1 });
    return res.json();
  },

  async post<T>(url: string, data: unknown): Promise<T> {
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async put<T>(url: string, data: unknown): Promise<T> {
    const res = await fetchWithRetry(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async patch<T>(url: string, data: unknown): Promise<T> {
    const res = await fetchWithRetry(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(url: string): Promise<void> {
    await fetchWithRetry(url, { method: "DELETE" });
  },

  async upload<T>(url: string, formData: FormData): Promise<T> {
    const res = await fetchWithRetry(url, { method: "POST", body: formData });
    return res.json();
  },
};
