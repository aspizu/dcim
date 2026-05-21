import httpx

from ._config import config

client = httpx.Client()

if config.session:
    client.cookies.set("session", config.session)
