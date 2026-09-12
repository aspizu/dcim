UPDATE album
SET (count, oldest, newest) = (
    SELECT COUNT(*), MIN(photo_id), MAX(photo_id)
    FROM photo_album
    WHERE album_id = album.id
);
