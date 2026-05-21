import rich_click as click


@click.group()
def cli() -> None:
    pass


from . import _login, _upload  # noqa: E402, F401
