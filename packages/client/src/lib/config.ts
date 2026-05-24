import * as api from "#services/api"

export async function pullConfig() {
  const config = await api.getConfig()
  localStorage.setItem("config", JSON.stringify(config))
}

export async function setConfig(key: string, value: string) {
  const config = JSON.parse(localStorage.getItem("config") ?? "{}")
  localStorage.setItem("config", JSON.stringify({...config, key: value}))
  await api.setConfig(key, value)
}

export function getConfig(key: string) {
  const config = JSON.parse(localStorage.getItem("config") ?? "{}")
  return config[key]
}
