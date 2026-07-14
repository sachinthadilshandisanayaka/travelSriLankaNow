package com.travesrilankanow.travesrilankanowbe.dto;

import java.util.List;

public record GalleryUpdateRequest(
        boolean enabled,
        List<GalleryItemRequestDto> items
) {}
