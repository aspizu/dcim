export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super("Network request failed")
    this.name = "NetworkError"
    this.cause = cause
  }
}

if (!import.meta.env.VITE_USERNAME) {
  throw new Error("[env] VITE_USERNAME is not set")
}

const API_URL = `https://dcim.${import.meta.env.VITE_USERNAME}.workers.dev`

export async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: {"Content-Type": "application/json"},
      body: method === "GET" ? undefined : JSON.stringify(body),
    })
  } catch (cause) {
    throw new NetworkError(cause)
  }
  if (!res.ok) {
    throw new ApiError(res.status, await res.text())
  }
  try {
    return (await res.json()) as T
  } catch (cause) {
    throw new NetworkError(cause)
  }
}