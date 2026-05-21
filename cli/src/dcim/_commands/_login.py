import logging

import rich_click as click

from dcim._client import client
from dcim._config import Config
from dcim._errors import AppError

from . import cli

log = logging.getLogger(__name__)


@cli.command()
@click.option("-i", "--instance", required=True)
@click.option("-c", "--code", required=True)
def login(instance: str, code: str) -> None:
    res = client.post(f"{instance}/api/auth/login", json={"totp": code})
    if res.status_code == 400:
        log.error("Failed to login due to incorrect code.")
        raise AppError
    session = res.cookies.get("session")
    assert session is not None
    config = Config(instance, session)
    config.save()
