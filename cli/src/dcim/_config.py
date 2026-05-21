from pathlib import Path

import msgspec
from msgspec import Struct

CONFIG_PATH = Path("~/.config/dcim.toml").expanduser()


class Config(Struct):
    instance: str | None = None
    session: str | None = None

    @staticmethod
    def load() -> Config:
        try:
            return msgspec.toml.decode(CONFIG_PATH.read_text(), type=Config)
        except FileNotFoundError:
            return Config()

    def save(self) -> None:
        CONFIG_PATH.write_bytes(msgspec.toml.encode(self))


config = Config.load()
