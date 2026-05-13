import {v4 as uuid} from "uuid"

type RequestMessage<T = unknown> = {type: "request"; id: string; data: T}

type ResponseMessage<T = unknown> =
  | {type: "response"; id: string; data: {success: true; value: T}}
  | {type: "response"; id: string; data: {success: false; error: string}}

type PendingRequest<T = unknown> = {
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

export class Client {
  private _worker: Worker

  private _requests = new Map<string, PendingRequest<any>>()

  constructor(worker: Worker) {
    this._worker = worker

    this._worker.addEventListener("message", (event: MessageEvent<ResponseMessage>) => {
      const message = event.data
      if (message.type !== "response") return
      const request = this._requests.get(message.id)
      if (!request) return
      this._requests.delete(message.id)
      if (message.data.success) {
        request.resolve(message.data.value)
      } else {
        request.reject(new Error(message.data.error))
      }
    })
  }

  request<TResponse = unknown, TRequest = unknown>(
    data: TRequest,
    timeoutMs?: number,
  ): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      const id = uuid()
      this._requests.set(id, {resolve, reject})
      if (timeoutMs !== undefined) {
        setTimeout(() => {
          if (!this._requests.has(id)) return
          this._requests.delete(id)
          reject(new Error(`Request timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      }
      const message: RequestMessage<TRequest> = {type: "request", id, data}
      this._worker.postMessage(message)
    })
  }
}

export abstract class Server<TRequest = unknown, TResponse = unknown> {
  constructor() {
    self.addEventListener("message", (event: MessageEvent<RequestMessage<TRequest>>) => {
      void (async () => {
        const message = event.data
        if (message.type !== "request") return
        const value = await this.handleRequest(message.data)
        const response: ResponseMessage<TResponse> = {
          type: "response",
          id: message.id,
          data: {
            success: true,
            value,
          },
        }
        self.postMessage(response)
      })()
    })
  }

  abstract handleRequest(data: TRequest): Promise<TResponse>
}
