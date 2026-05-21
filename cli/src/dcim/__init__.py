import functools
import logging
from time import perf_counter_ns
from typing import Callable

from rich import print

from ._commands import cli
from ._errors import AppError
from ._logging import setup_logging

log = logging.getLogger(__name__)


def entrypoint(func: Callable[[], int]) -> Callable[[], int]:
    @functools.wraps(func)
    def wrapper() -> int:
        before = perf_counter_ns()
        success = func() == 0
        after = perf_counter_ns()
        color = "[green]" if success else "[red]"
        print(f"[dim][bold]{color}Finished[/] in {(after - before) / 1e6}ms")
        if not success:
            return 1
        return 0

    return wrapper


@entrypoint
def main() -> int:
    setup_logging()
    try:
        cli()
        return 0
    except AppError:
        return 1
