import {signal, type Signal} from "@preact/signals-react"

import * as api from "#services/api"
import {SequentialScheduler} from "#utils/schedulers"

export class Option {
  private _key: string
  private _signal: Signal<string>
  private _timeout: ReturnType<typeof setTimeout> | undefined
  private _scheduler: SequentialScheduler

  constructor(key: string, initialValue: string = "") {
    this._key = key
    const config = JSON.parse(localStorage.getItem("config") ?? "{}")
    this._signal = signal(config[key] ?? initialValue)
    this._scheduler = new SequentialScheduler()
  }

  peek() {
    return this._signal.peek()
  }

  get() {
    return this._signal.value
  }

  set(newValue: string) {
    this._signal.value = newValue
    const config = JSON.parse(localStorage.getItem("config") ?? "{}")
    localStorage.setItem("config", JSON.stringify({...config, [this._key]: this._signal.value}))
    clearTimeout(this._timeout)
    this._timeout = setTimeout(() => {
      this._scheduler.schedule(async () => {
        await api.setConfig(this._key, this._signal.peek())
        this._signal.value = newValue
      })
    }, 600)
  }

  DANGEROUSLY_SET_VALUE(newValue: string) {
    this._signal.value = newValue
  }
}

export async function pullConfig(options: Record<string, Option>) {
  const config = await api.getConfig()
  localStorage.setItem("config", JSON.stringify(config))
  for (const [key, value] of Object.entries(config)) {
    const option = options[key]
    if (option === undefined) continue
    option.DANGEROUSLY_SET_VALUE(value)
  }
}
