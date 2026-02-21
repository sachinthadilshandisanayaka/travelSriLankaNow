package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.Media;
import com.travesrilankanow.travesrilankanowbe.entity.MediaType;
import com.travesrilankanow.travesrilankanowbe.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for media management in the admin panel.
 * Provides comprehensive API for uploading, editing, and managing images.
 */
@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminMediaController {

    private final MediaService mediaService;

    /**
     * Upload a single image.
     * POST /api/admin/media/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "mediaType", defaultValue = "GENERAL") String mediaTypeStr,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "caption", required = false) String caption
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            MediaType mediaType = MediaType.valueOf(mediaTypeStr.toUpperCase());
            Media media = mediaService.uploadImage(file, mediaType, altText, caption);

            response.put("success", true);
            response.put("message", "Image uploaded successfully");
            response.put("data", mediaToMap(media));

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (IOException e) {
            log.error("Error uploading image", e);
            response.put("success", false);
            response.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Upload multiple images.
     * POST /api/admin/media/upload/multiple
     */
    @PostMapping("/upload/multiple")
    public ResponseEntity<Map<String, Object>> uploadMultipleImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "mediaType", defaultValue = "GENERAL") String mediaTypeStr
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            MediaType mediaType = MediaType.valueOf(mediaTypeStr.toUpperCase());
            List<Media> mediaList = mediaService.uploadImages(files, mediaType);

            response.put("success", true);
            response.put("message", "Images uploaded successfully");
            response.put("data", mediaList.stream().map(this::mediaToMap).toList());
            response.put("count", mediaList.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error uploading multiple images", e);
            response.put("success", false);
            response.put("message", "Failed to upload images: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Upload image with transformations (crop, rotate).
     * POST /api/admin/media/upload/transform
     */
    @PostMapping("/upload/transform")
    public ResponseEntity<Map<String, Object>> uploadWithTransformation(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "mediaType", defaultValue = "GENERAL") String mediaTypeStr,
            @RequestParam(value = "cropX", required = false) Integer cropX,
            @RequestParam(value = "cropY", required = false) Integer cropY,
            @RequestParam(value = "cropWidth", required = false) Integer cropWidth,
            @RequestParam(value = "cropHeight", required = false) Integer cropHeight,
            @RequestParam(value = "rotate", required = false) Integer rotate,
            @RequestParam(value = "altText", required = false) String altText
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            MediaType mediaType = MediaType.valueOf(mediaTypeStr.toUpperCase());
            Media media = mediaService.uploadWithTransformation(
                    file, mediaType, cropX, cropY, cropWidth, cropHeight, rotate, altText
            );

            response.put("success", true);
            response.put("message", "Image uploaded and transformed successfully");
            response.put("data", mediaToMap(media));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error uploading with transformation", e);
            response.put("success", false);
            response.put("message", "Failed to process image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Replace an existing image.
     * PUT /api/admin/media/{id}/replace
     */
    @PutMapping("/{id}/replace")
    public ResponseEntity<Map<String, Object>> replaceImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            Media media = mediaService.replaceImage(id, file);

            response.put("success", true);
            response.put("message", "Image replaced successfully");
            response.put("data", mediaToMap(media));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error replacing image", e);
            response.put("success", false);
            response.put("message", "Failed to replace image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Update media metadata.
     * PUT /api/admin/media/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateMetadata(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            String altText = (String) updates.get("altText");
            String caption = (String) updates.get("caption");
            Integer sortOrder = updates.get("sortOrder") != null ?
                    ((Number) updates.get("sortOrder")).intValue() : null;

            Media media = mediaService.updateMetadata(id, altText, caption, sortOrder);

            response.put("success", true);
            response.put("message", "Media updated successfully");
            response.put("data", mediaToMap(media));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating media", e);
            response.put("success", false);
            response.put("message", "Failed to update media: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Link media to an entity.
     * POST /api/admin/media/{id}/link
     */
    @PostMapping("/{id}/link")
    public ResponseEntity<Map<String, Object>> linkToEntity(
            @PathVariable Long id,
            @RequestBody Map<String, Object> linkData
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            String entityType = (String) linkData.get("entityType");
            Long entityId = ((Number) linkData.get("entityId")).longValue();

            mediaService.linkToEntity(id, entityType, entityId);

            response.put("success", true);
            response.put("message", "Media linked successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error linking media", e);
            response.put("success", false);
            response.put("message", "Failed to link media: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get media by ID.
     * GET /api/admin/media/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        return mediaService.getById(id)
                .map(media -> {
                    response.put("success", true);
                    response.put("data", mediaToMap(media));
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("message", "Media not found");
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Get all media with pagination.
     * GET /api/admin/media
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Map<String, Object> response = new HashMap<>();

        Page<Media> mediaPage = mediaService.getAllPaginated(page, size);

        response.put("success", true);
        response.put("data", mediaPage.getContent().stream().map(this::mediaToMap).toList());
        response.put("totalElements", mediaPage.getTotalElements());
        response.put("totalPages", mediaPage.getTotalPages());
        response.put("currentPage", mediaPage.getNumber());

        return ResponseEntity.ok(response);
    }

    /**
     * Get media by type.
     * GET /api/admin/media/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<Map<String, Object>> getByType(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            MediaType mediaType = MediaType.valueOf(type.toUpperCase());
            Page<Media> mediaPage = mediaService.getByTypePaginated(mediaType, page, size);

            response.put("success", true);
            response.put("data", mediaPage.getContent().stream().map(this::mediaToMap).toList());
            response.put("totalElements", mediaPage.getTotalElements());
            response.put("totalPages", mediaPage.getTotalPages());
            response.put("currentPage", mediaPage.getNumber());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Invalid media type");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Search media.
     * GET /api/admin/media/search
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Map<String, Object> response = new HashMap<>();

        Page<Media> mediaPage = mediaService.search(query, page, size);

        response.put("success", true);
        response.put("data", mediaPage.getContent().stream().map(this::mediaToMap).toList());
        response.put("totalElements", mediaPage.getTotalElements());
        response.put("totalPages", mediaPage.getTotalPages());
        response.put("currentPage", mediaPage.getNumber());

        return ResponseEntity.ok(response);
    }

    /**
     * Get recent uploads.
     * GET /api/admin/media/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentUploads() {
        Map<String, Object> response = new HashMap<>();

        List<Media> recentMedia = mediaService.getRecentUploads();

        response.put("success", true);
        response.put("data", recentMedia.stream().map(this::mediaToMap).toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get media for a specific entity.
     * GET /api/admin/media/entity/{entityType}/{entityId}
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<Map<String, Object>> getForEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId
    ) {
        Map<String, Object> response = new HashMap<>();

        List<Media> mediaList = mediaService.getForEntity(entityType, entityId);

        response.put("success", true);
        response.put("data", mediaList.stream().map(this::mediaToMap).toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get storage statistics.
     * GET /api/admin/media/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> response = new HashMap<>();

        Map<String, Object> stats = mediaService.getStorageStats();

        response.put("success", true);
        response.put("data", stats);

        return ResponseEntity.ok(response);
    }

    /**
     * Get transformed URL for an image.
     * GET /api/admin/media/{id}/transform
     */
    @GetMapping("/{id}/transform")
    public ResponseEntity<Map<String, Object>> getTransformedUrl(
            @PathVariable Long id,
            @RequestParam(required = false) Integer width,
            @RequestParam(required = false) Integer height,
            @RequestParam(required = false) Integer quality,
            @RequestParam(required = false) String crop
    ) {
        Map<String, Object> response = new HashMap<>();

        return mediaService.getById(id)
                .map(media -> {
                    String url = mediaService.getTransformedUrl(
                            media.getPublicId(), width, height, quality, crop
                    );
                    response.put("success", true);
                    response.put("url", url);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("message", "Media not found");
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Delete media permanently.
     * DELETE /api/admin/media/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            mediaService.delete(id);

            response.put("success", true);
            response.put("message", "Media deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error deleting media", e);
            response.put("success", false);
            response.put("message", "Failed to delete media: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Soft delete (deactivate) media.
     * DELETE /api/admin/media/{id}/soft
     */
    @DeleteMapping("/{id}/soft")
    public ResponseEntity<Map<String, Object>> softDelete(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            mediaService.softDelete(id);

            response.put("success", true);
            response.put("message", "Media deactivated successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error soft deleting media", e);
            response.put("success", false);
            response.put("message", "Failed to deactivate media: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Cleanup unused media.
     * POST /api/admin/media/cleanup
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupUnused(
            @RequestParam(defaultValue = "30") int daysOld
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            int count = mediaService.cleanupUnusedMedia(daysOld);

            response.put("success", true);
            response.put("message", String.format("Cleaned up %d unused media files", count));
            response.put("deletedCount", count);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error cleaning up media", e);
            response.put("success", false);
            response.put("message", "Failed to cleanup media: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Convert Media entity to Map for JSON response.
     */
    private Map<String, Object> mediaToMap(Media media) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", media.getId());
        map.put("originalFilename", media.getOriginalFilename());
        map.put("publicId", media.getPublicId());
        map.put("url", media.getUrl());
        map.put("optimizedUrl", media.getOptimizedUrl());
        map.put("thumbnailUrl", media.getThumbnailUrl());
        map.put("mediumUrl", media.getMediumUrl());
        map.put("mediaType", media.getMediaType().name());
        map.put("format", media.getFormat());
        map.put("width", media.getWidth());
        map.put("height", media.getHeight());
        map.put("fileSize", media.getFileSize());
        map.put("altText", media.getAltText());
        map.put("caption", media.getCaption());
        map.put("folder", media.getFolder());
        map.put("entityReference", media.getEntityReference());
        map.put("isActive", media.getIsActive());
        map.put("sortOrder", media.getSortOrder());
        map.put("createdAt", media.getCreatedAt());
        map.put("updatedAt", media.getUpdatedAt());
        return map;
    }
}
