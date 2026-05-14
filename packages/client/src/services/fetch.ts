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

export async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch("/api" + path, {
      method,
      credentials: "include",
      headers: {"Content-Type": "application/json"},
      body: method === "GET" ? undefined : JSON.stringify(body),
    })
  } catch (cause) {
    throw new NetworkError(cause)
  }
  if (!res.ok) {
    if (res.headers.get("content-type")?.startsWith("text/html")) {
      throw new ApiError(res.status, `Worker threw exception (${res.headers.get("cf-ray")})`)
    }
    throw new ApiError(res.status, await res.text())
  }
  try {
    return (await res.json()) as T
  } catch (cause) {
    throw new NetworkError(cause)
  }
}
