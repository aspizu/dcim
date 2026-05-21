import base64
import hashlib
import json
import logging
import subprocess
import tempfile
from io import BytesIO
from pathlib import Path
from typing import IO

import PIL.Image
import rich_click as click
from rich import print

from dcim._client import client
from dcim._config import config
from dcim._errors import AppError

from . import cli

log = logging.getLogger(__name__)


def create_thumbhash(im: PIL.Image.Image) -> str:
    buf = BytesIO()
    im.resize((8, 8), PIL.Image.Resampling.LANCZOS).save(buf, "WEBP", quality=0)
    return f"data:image/webp;base64,{base64.b64encode(buf.getbuffer()).decode()}"


def create_thumbnail(im: PIL.Image.Image, out: str) -> None:
    a = im.width / im.height
    w = min(im.width, 720)
    h = min(im.height, 720)
    if w < h:
        h = int(w / a)
    else:
        w = int(h * a)
    im.resize((w, h), PIL.Image.Resampling.LANCZOS).save(out, "WEBP", quality=50)


def sha256(f: IO[bytes]) -> tuple[int, str]:
    length = 0
    h = hashlib.sha256()
    while chunk := f.read(8192):
        h.update(chunk)
        length += len(chunk)
    return length, base64.b64encode(h.digest()).decode()


@cli.command()
@click.argument("file", type=Path)
def upload(file: Path) -> None:
    if not config.instance:
        log.error("instance url not set in config")
        raise AppError
    if not config.session:
        log.error("not logged in, run `dcim login`")
        raise AppError
    with file.open("rb") as f:
        image_content_length, image_sha256 = sha256(f)
    im = PIL.Image.open(file)
    thumbhash = create_thumbhash(im)
    with tempfile.NamedTemporaryFile(suffix=".webp") as thumbnail_file:
        create_thumbnail(im, thumbnail_file.name)
        with open(thumbnail_file.name, "rb") as ff:
            thumbnail_content_length, thumbnail_sha256 = sha256(ff)
        res = client.post(
            f"{config.instance}/api/photo",
            json={
                "fileName": file.name,
                "image": {
                    "contentType": PIL.Image.MIME[im.format or "JPEG"],
                    "contentSHA256": image_sha256,
                    "contentLength": image_content_length,
                },
                "thumbnail": {
                    "contentType": "image/webp",
                    "contentSHA256": thumbnail_sha256,
                    "contentLength": thumbnail_content_length,
                },
                "thumbhash": thumbhash,
                "width": im.width,
                "height": im.height,
                "metadata": {},
            },
        )
        res.raise_for_status()
        data = res.json()
        subprocess.run(
            [
                "wget",
                "--no-verbose",
                "--show-progress",
                "--method=PUT",
                f"--body-file={file}",
                f"--header=Content-Type: {PIL.Image.MIME[im.format or 'JPEG']}",
                "--header=Cache-Control: public, max-age=31536000, immutable, no-transform",
                f"--header=Content-Disposition: attachment; filename={json.dumps(file.name)}",
                f"--header=x-amz-checksum-sha256: {image_sha256}",
                data["imagePresignedURL"],
                "-O/dev/null",
            ],
            check=True,
        )
        subprocess.run(
            [
                "wget",
                "--no-verbose",
                "--show-progress",
                "--method=PUT",
                f"--body-file={thumbnail_file.name}",
                "--header=Content-Type: image/webp",
                "--header=Cache-Control: public, max-age=31536000, immutable, no-transform",
                f"--header=x-amz-checksum-sha256: {thumbnail_sha256}",
                data["thumbnailPresignedURL"],
                "-O/dev/null",
            ],
            check=True,
        )
        client.post(
            f"{config.instance}/api/photo/{data['id']}/mark-as-uploaded"
        ).raise_for_status()
    print(f"Uploaded photo at {config.instance}/p/{data['id']}")
