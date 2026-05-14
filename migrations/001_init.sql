create table photo (
    id text primary key,
    image_url text not null,
    thumbnail_url text not null,
    thumbhash text not null,
    content_length integer not null,
    file_name text not null,
    status text not null default 'pending',
    metadata text not null default '{}',
    width integer not null,
    height integer not null,
    uploaded_at text not null
) strict, without rowid;

create table album (
    id text primary key,
    name text not null default 'Untitled',
    count integer not null default 0,
    oldest text default null,
    newest text default null,
    updated_at text not null
) strict, without rowid;

create table photo_album (
    album_id integer not null,
    photo_id integer not null,
    foreign key (album_id) references album (id) on delete cascade,
    foreign key (photo_id) references photo (id) on delete cascade,
    primary key (album_id, photo_id)
) strict, without rowid;
