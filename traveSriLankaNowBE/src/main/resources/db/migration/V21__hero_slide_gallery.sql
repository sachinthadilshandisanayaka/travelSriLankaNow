CREATE TABLE IF NOT EXISTS hero_slide_gallery (
    id BIGSERIAL PRIMARY KEY,
    hero_slide_id BIGINT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_hsg_slide FOREIGN KEY (hero_slide_id) REFERENCES hero_slides(id) ON DELETE CASCADE,
    CONSTRAINT uq_hsg_slide UNIQUE (hero_slide_id)
);

CREATE TABLE IF NOT EXISTS hero_slide_gallery_items (
    id BIGSERIAL PRIMARY KEY,
    gallery_id BIGINT NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_id BIGINT NOT NULL,
    image_url VARCHAR(1024) NOT NULL,
    label VARCHAR(255),
    link VARCHAR(512),
    display_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_hsgi_gallery FOREIGN KEY (gallery_id) REFERENCES hero_slide_gallery(id) ON DELETE CASCADE
);
