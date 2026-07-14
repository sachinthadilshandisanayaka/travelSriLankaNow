package com.travesrilankanow.travesrilankanowbe.dto;

public record GalleryItemRequestDto(
        String contentType,
        Long contentId,
        String imageUrl,
        String label,
        String link
) {}
