import base64
import hashlib
import json
import logging
import subprocess
import tempfile
from dataclasses import dataclass
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

DEFAULT_THUMBNAIL_QUALITY = "balanced"
DEFAULT_BACKUP_QUALITY = "original"
THUMBNAIL_PRESETS = {
    "low": (480, 25),
    "balanced": (720, 50),
    "high": (1024, 75),
}
STORAGE_SAVER_QUALITY = 90


@dataclass(frozen=True)
class PreparedImage:
    data: bytes
    content_type: str
    content_length: int
    sha256: str


@dataclass(frozen=True)
class PreparedUpload:
    image: PreparedImage
    thumbnail: PreparedImage
    thumbhash: str


def compression_ratio(
    width: int, height: int, file_size_bytes: int, bit_depth: int = 24
) -> float:
    return (width * height * (bit_depth / 8)) / file_size_bytes


def image_content_type(im: PIL.Image.Image) -> str:
    return PIL.Image.MIME[im.format or "JPEG"]


def resize_to_fit(width: int, height: int, size: int) -> tuple[int, int]:
    ratio = min(size / width, size / height, 1)
    return round(width * ratio), round(height * ratio)


def sha256_bytes(data: bytes) -> tuple[int, str]:
    h = hashlib.sha256(data)
    return len(data), base64.b64encode(h.digest()).decode()


def webp_bytes(im: PIL.Image.Image, quality: int) -> bytes:
    buf = BytesIO()
    im.save(buf, "WEBP", quality=quality)
    return buf.getvalue()


def resized_webp_bytes(im: PIL.Image.Image, size: int, quality: int) -> bytes:
    width, height = resize_to_fit(im.width, im.height, size)
    return webp_bytes(im.resize((width, height), PIL.Image.Resampling.LANCZOS), quality)


def prepared_image(data: bytes, content_type: str) -> PreparedImage:
    length, checksum = sha256_bytes(data)
    return PreparedImage(data, content_type, length, checksum)


def create_thumbhash(im: PIL.Image.Image) -> str:
    data = webp_bytes(im.resize((8, 8), PIL.Image.Resampling.LANCZOS), 0)
    return f"data:image/webp;base64,{base64.b64encode(data).decode()}"


def prepare_thumbnail(im: PIL.Image.Image, thumbnail_quality: str) -> PreparedImage:
    if thumbnail_quality not in THUMBNAIL_PRESETS:
        raise click.BadParameter(f"Invalid thumbnail quality: {thumbnail_quality}")
    size, quality = THUMBNAIL_PRESETS[thumbnail_quality]
    return prepared_image(resized_webp_bytes(im, size, quality), "image/webp")


def storage_saver_image(im: PIL.Image.Image, original: bytes) -> PreparedImage:
    data = webp_bytes(im, STORAGE_SAVER_QUALITY)
    if len(data) > len(original):
        return prepared_image(original, image_content_type(im))
    return prepared_image(data, "image/webp")


def prepare_backup(
    im: PIL.Image.Image, original: bytes, backup_quality: str
) -> PreparedImage:
    if backup_quality == "original":
        return prepared_image(original, image_content_type(im))
    if backup_quality == "smart":
        ratio = compression_ratio(im.width, im.height, len(original))
        if ratio < 0.15:
            return prepared_image(original, image_content_type(im))
        return storage_saver_image(im, original)
    if backup_quality == "storageSaver":
        return storage_saver_image(im, original)
    raise click.BadParameter(f"backupQuality is invalid: {backup_quality}")


def prepare_upload(
    im: PIL.Image.Image,
    original: bytes,
    thumbnail_quality: str,
    backup_quality: str,
) -> PreparedUpload:
    return PreparedUpload(
        prepare_backup(im, original, backup_quality),
        prepare_thumbnail(im, thumbnail_quality),
        create_thumbhash(im),
    )


def put_file(url: str, file: str, headers: dict[str, str]) -> None:
    args = [
        "wget",
        "--no-verbose",
        "--show-progress",
        "--method=PUT",
        f"--body-file={file}",
    ]
    for key, value in headers.items():
        args.append(f"--header={key}: {value}")
    args.extend([url, "-O/dev/null"])
    subprocess.run(args, check=True)


def write_temp_file(file: IO[bytes], data: bytes) -> None:
    file.write(data)
    file.flush()


@cli.command()
@click.argument("file", type=Path)
def upload(file: Path) -> None:
    if not config.instance:
        log.error("instance url not set in config")
        raise AppError
    if not config.session:
        log.error("not logged in, run `dcim login`")
        raise AppError
    im = PIL.Image.open(file)
    im.load()
    with file.open("rb") as f:
        original = f.read()
    config_res = client.get(f"{config.instance}/api/config")
    config_res.raise_for_status()
    upload_config = config_res.json()
    prepared = prepare_upload(
        im,
        original,
        upload_config.get("thumbnailQuality", DEFAULT_THUMBNAIL_QUALITY),
        upload_config.get("backupQuality", DEFAULT_BACKUP_QUALITY),
    )
    with (
        tempfile.NamedTemporaryFile(suffix=Path(file.name).suffix) as image_file,
        tempfile.NamedTemporaryFile(suffix=".webp") as thumbnail_file,
    ):
        write_temp_file(image_file, prepared.image.data)
        write_temp_file(thumbnail_file, prepared.thumbnail.data)
        res = client.post(
            f"{config.instance}/api/photo",
            json={
                "fileName": file.name,
                "image": {
                    "contentType": prepared.image.content_type,
                    "contentSHA256": prepared.image.sha256,
                    "contentLength": prepared.image.content_length,
                },
                "thumbnail": {
                    "contentType": prepared.thumbnail.content_type,
                    "contentSHA256": prepared.thumbnail.sha256,
                    "contentLength": prepared.thumbnail.content_length,
                },
                "thumbhash": prepared.thumbhash,
                "width": im.width,
                "height": im.height,
                "metadata": {},
            },
        )
        res.raise_for_status()
        data = res.json()
        put_file(
            data["imagePresignedURL"],
            image_file.name,
            {
                "Content-Type": prepared.image.content_type,
                "Cache-Control": "public, max-age=31536000, immutable, no-transform",
                "Content-Disposition": f"attachment; filename={json.dumps(file.name)}",
                "x-amz-checksum-sha256": prepared.image.sha256,
            },
        )
        put_file(
            data["thumbnailPresignedURL"],
            thumbnail_file.name,
            {
                "Content-Type": prepared.thumbnail.content_type,
                "Cache-Control": "public, max-age=31536000, immutable, no-transform",
                "x-amz-checksum-sha256": prepared.thumbnail.sha256,
            },
        )
        client.post(
            f"{config.instance}/api/photo/{data['id']}/mark-as-uploaded"
        ).raise_for_status()
    print(f"Uploaded photo at {config.instance}/p/{data['id']}")
