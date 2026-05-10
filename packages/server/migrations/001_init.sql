create table image (
    id text not null,
    image_url text not null,
    thumbnail_url text not null,
    thumbhash text not null,
    content_sha256 text not null,
    timestamp text not null,
    content_type text not null,
    content_length integer not null,
    file_name text not null,
    status text not null default 'pending',
    metadata text not null,
    primary key (id)
);

create table album (
    id text not null,
    name text not null,
    description text default null,
    metadata text not null,
    primary key (id)
);

create table image_album (
    album_id text not null,
    image_id text not null,
    foreign key (album_id) references album (id) on delete cascade,
    foreign key (image_id) references image (id) on delete cascade,
    primary key (album_id, image_id)
);
