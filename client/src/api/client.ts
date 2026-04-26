import type { ApiEnvelope, ApiErrorResponse } from "shared";

export class ApiError extends Error {
  public code: string | undefined;
  public details: unknown;
  public statusCode: number;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(
      response.status,
      body?.error?.message ?? response.statusText,
      body?.error?.code ?? undefined,
      body?.error?.details,
    );
  }

  const body = (await response.json()) as ApiEnvelope<T>;
  return body.data;
}

export async function get<T>(url: string, headers?: HeadersInit): Promise<T> {
  const response = await fetch(url, { headers });
  return handleResponse<T>(response);
}

export async function post<T>(url: string, data?: unknown, headers?: HeadersInit): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: data ? JSON.stringify(data) : undefined,
  });
  return handleResponse<T>(response);
}

export async function patch<T>(url: string, data: unknown, headers?: HeadersInit): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function del<T>(url: string, headers?: HeadersInit): Promise<T> {
  const response = await fetch(url, { method: "DELETE", headers });
  return handleResponse<T>(response);
}
