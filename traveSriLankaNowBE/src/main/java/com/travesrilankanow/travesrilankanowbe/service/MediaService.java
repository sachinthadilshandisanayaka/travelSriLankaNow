package com.travesrilankanow.travesrilankanowbe.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.travesrilankanow.travesrilankanowbe.entity.Media;
import com.travesrilankanow.travesrilankanowbe.entity.MediaType;
import com.travesrilankanow.travesrilankanowbe.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Comprehensive service for media/image management.
 * Handles upload, processing, optimization, and CRUD operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MediaService {

    private final Cloudinary cloudinary;
    private final MediaRepository mediaRepository;

    // Configuration constants
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final int THUMBNAIL_SIZE = 150;
    private static final int MEDIUM_WIDTH = 600;
    private static final int OPTIMIZED_QUALITY = 80;

    // Folder mapping for different media types
    private static final Map<MediaType, String> FOLDER_MAP = Map.of(
            MediaType.HERO_SLIDE, "hero-slides",
            MediaType.PAGE_HEADER, "page-headers",
            MediaType.LOCATION, "locations",
            MediaType.LOCATION_GALLERY, "locations/gallery",
            MediaType.EVENT, "events",
            MediaType.PLACE, "places",
            MediaType.PLACE_GALLERY, "places/gallery",
            MediaType.GALLERY, "gallery",
            MediaType.GENERAL, "general"
    );

    /**
     * Upload a single image with full processing pipeline.
     */
    @Transactional
    public Media uploadImage(MultipartFile file, MediaType mediaType, String altText, String caption) throws IOException {
        validateFile(file);

        String folder = FOLDER_MAP.getOrDefault(mediaType, "general");

        // Get image dimensions before upload
        BufferedImage bufferedImage = ImageIO.read(file.getInputStream());
        int originalWidth = bufferedImage != null ? bufferedImage.getWidth() : 0;
        int originalHeight = bufferedImage != null ? bufferedImage.getHeight() : 0;

        // Upload to Cloudinary with auto-optimization
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "travel-sri-lanka/" + folder,
                "resource_type", "image",
                "quality", "auto:good",
                "fetch_format", "auto"
        ));

        String publicId = (String) uploadResult.get("public_id");
        String url = (String) uploadResult.get("secure_url");
        String format = (String) uploadResult.get("format");
        Integer width = (Integer) uploadResult.get("width");
        Integer height = (Integer) uploadResult.get("height");
        Long bytes = ((Number) uploadResult.get("bytes")).longValue();

        // Generate variant URLs
        String thumbnailUrl = generateThumbnailUrl(publicId);
        String mediumUrl = generateMediumUrl(publicId);
        String optimizedUrl = generateOptimizedUrl(publicId, width, height);

        // Create and save Media entity
        Media media = Media.builder()
                .originalFilename(file.getOriginalFilename())
                .publicId(publicId)
                .url(url)
                .optimizedUrl(optimizedUrl)
                .thumbnailUrl(thumbnailUrl)
                .mediumUrl(mediumUrl)
                .mediaType(mediaType)
                .format(format)
                .width(width)
                .height(height)
                .fileSize(bytes)
                .altText(altText)
                .caption(caption)
                .folder(folder)
                .isActive(true)
                .sortOrder(0)
                .build();

        return mediaRepository.save(media);
    }

    /**
     * Upload multiple images.
     */
    @Transactional
    public List<Media> uploadImages(List<MultipartFile> files, MediaType mediaType) throws IOException {
        List<Media> uploadedMedia = new ArrayList<>();
        int order = 0;

        for (MultipartFile file : files) {
            Media media = uploadImage(file, mediaType, null, null);
            media.setSortOrder(order++);
            uploadedMedia.add(mediaRepository.save(media));
        }

        return uploadedMedia;
    }

    /**
     * Upload image with crop/transformation data.
     */
    @Transactional
    public Media uploadWithTransformation(
            MultipartFile file,
            MediaType mediaType,
            Integer cropX, Integer cropY,
            Integer cropWidth, Integer cropHeight,
            Integer rotate,
            String altText
    ) throws IOException {
        validateFile(file);

        String folder = FOLDER_MAP.getOrDefault(mediaType, "general");

        // Build transformation
        Transformation transformation = new Transformation();

        if (cropX != null && cropY != null && cropWidth != null && cropHeight != null) {
            transformation.crop("crop")
                    .x(cropX).y(cropY)
                    .width(cropWidth).height(cropHeight);
        }

        if (rotate != null && rotate != 0) {
            transformation.angle(rotate);
        }

        // Always optimize
        transformation.quality("auto:good").fetchFormat("auto");

        // Upload with transformation
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "travel-sri-lanka/" + folder,
                "resource_type", "image",
                "transformation", transformation
        ));

        String publicId = (String) uploadResult.get("public_id");
        String url = (String) uploadResult.get("secure_url");
        String format = (String) uploadResult.get("format");
        Integer width = (Integer) uploadResult.get("width");
        Integer height = (Integer) uploadResult.get("height");
        Long bytes = ((Number) uploadResult.get("bytes")).longValue();

        // Store crop data for re-editing
        String cropData = null;
        if (cropX != null) {
            cropData = String.format("{\"x\":%d,\"y\":%d,\"width\":%d,\"height\":%d}",
                    cropX, cropY, cropWidth, cropHeight);
        }

        String transformationData = null;
        if (rotate != null && rotate != 0) {
            transformationData = String.format("{\"rotate\":%d}", rotate);
        }

        Media media = Media.builder()
                .originalFilename(file.getOriginalFilename())
                .publicId(publicId)
                .url(url)
                .optimizedUrl(generateOptimizedUrl(publicId, width, height))
                .thumbnailUrl(generateThumbnailUrl(publicId))
                .mediumUrl(generateMediumUrl(publicId))
                .mediaType(mediaType)
                .format(format)
                .width(width)
                .height(height)
                .fileSize(bytes)
                .altText(altText)
                .folder(folder)
                .cropData(cropData)
                .transformationData(transformationData)
                .isActive(true)
                .sortOrder(0)
                .build();

        return mediaRepository.save(media);
    }

    /**
     * Replace an existing image (upload new, delete old).
     */
    @Transactional
    public Media replaceImage(Long mediaId, MultipartFile file) throws IOException {
        Media existing = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found with ID: " + mediaId));

        // Delete old image from Cloudinary
        deleteFromCloudinary(existing.getPublicId());

        // Upload new image with same settings
        Media newMedia = uploadImage(file, existing.getMediaType(), existing.getAltText(), existing.getCaption());

        // Copy over references and metadata
        newMedia.setEntityReference(existing.getEntityReference());
        newMedia.setSortOrder(existing.getSortOrder());

        // Delete old record
        mediaRepository.delete(existing);

        return mediaRepository.save(newMedia);
    }

    /**
     * Update media metadata (alt text, caption, etc.).
     */
    @Transactional
    public Media updateMetadata(Long id, String altText, String caption, Integer sortOrder) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found with ID: " + id));

        if (altText != null) media.setAltText(altText);
        if (caption != null) media.setCaption(caption);
        if (sortOrder != null) media.setSortOrder(sortOrder);

        return mediaRepository.save(media);
    }

    /**
     * Link media to an entity.
     */
    @Transactional
    public void linkToEntity(Long mediaId, String entityType, Long entityId) {
        String reference = entityType + ":" + entityId;
        mediaRepository.updateEntityReference(mediaId, reference);
    }

    /**
     * Unlink media from entity.
     */
    @Transactional
    public void unlinkFromEntity(Long mediaId) {
        mediaRepository.updateEntityReference(mediaId, null);
    }

    /**
     * Get media by ID.
     */
    public Optional<Media> getById(Long id) {
        return mediaRepository.findById(id);
    }

    /**
     * Get media by public ID.
     */
    public Optional<Media> getByPublicId(String publicId) {
        return mediaRepository.findByPublicId(publicId);
    }

    /**
     * Get media by URL.
     */
    public Optional<Media> getByUrl(String url) {
        return mediaRepository.findByUrl(url);
    }

    /**
     * Get all media by type.
     */
    public List<Media> getByType(MediaType type) {
        return mediaRepository.findByMediaTypeAndIsActiveTrueOrderBySortOrderAsc(type);
    }

    /**
     * Get paginated media by type.
     */
    public Page<Media> getByTypePaginated(MediaType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return mediaRepository.findByMediaType(type, pageable);
    }

    /**
     * Get all active media paginated.
     */
    public Page<Media> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return mediaRepository.findByIsActiveTrue(pageable);
    }

    /**
     * Search media.
     */
    public Page<Media> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return mediaRepository.searchMedia(query, pageable);
    }

    /**
     * Get recent uploads.
     */
    public List<Media> getRecentUploads() {
        return mediaRepository.findTop20ByOrderByCreatedAtDesc();
    }

    /**
     * Get media for an entity.
     */
    public List<Media> getForEntity(String entityType, Long entityId) {
        String reference = entityType + ":" + entityId;
        return mediaRepository.findByEntityReferenceOrderBySortOrderAsc(reference);
    }

    /**
     * Delete media permanently.
     */
    @Transactional
    public void delete(Long id) throws IOException {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found with ID: " + id));

        deleteFromCloudinary(media.getPublicId());
        mediaRepository.delete(media);

        log.info("Deleted media: {} ({})", media.getOriginalFilename(), media.getPublicId());
    }

    /**
     * Soft delete (deactivate) media.
     */
    @Transactional
    public void softDelete(Long id) {
        mediaRepository.softDelete(id);
    }

    /**
     * Cleanup unused media older than specified days.
     */
    @Transactional
    public int cleanupUnusedMedia(int daysOld) throws IOException {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysOld);
        List<Media> unusedMedia = mediaRepository.findUnusedMediaOlderThan(cutoff);

        int count = 0;
        for (Media media : unusedMedia) {
            try {
                deleteFromCloudinary(media.getPublicId());
                mediaRepository.delete(media);
                count++;
            } catch (Exception e) {
                log.error("Failed to delete unused media: {}", media.getPublicId(), e);
            }
        }

        log.info("Cleaned up {} unused media files older than {} days", count, daysOld);
        return count;
    }

    /**
     * Get storage statistics.
     */
    public Map<String, Object> getStorageStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalSize = mediaRepository.getTotalStorageUsed();
        stats.put("totalStorageBytes", totalSize);
        stats.put("totalStorageMB", totalSize / (1024.0 * 1024.0));

        Map<String, Long> byType = new HashMap<>();
        for (MediaType type : MediaType.values()) {
            byType.put(type.name(), mediaRepository.countByMediaType(type));
        }
        stats.put("countByType", byType);

        return stats;
    }

    /**
     * Generate custom transformation URL.
     */
    public String getTransformedUrl(String publicId, Integer width, Integer height, Integer quality, String crop) {
        Transformation transformation = new Transformation();

        if (width != null) transformation.width(width);
        if (height != null) transformation.height(height);
        if (quality != null) {
            transformation.quality(quality);
        } else {
            transformation.quality("auto:good");
        }
        if (crop != null) {
            transformation.crop(crop);
        } else {
            transformation.crop("fill");
        }
        transformation.fetchFormat("auto");

        return cloudinary.url()
                .transformation(transformation)
                .secure(true)
                .generate(publicId);
    }

    // Private helper methods

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    String.format("File size exceeds maximum allowed size of %d MB", MAX_FILE_SIZE / (1024 * 1024))
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP"
            );
        }
    }

    private String generateThumbnailUrl(String publicId) {
        return cloudinary.url()
                .transformation(new Transformation()
                        .width(THUMBNAIL_SIZE)
                        .height(THUMBNAIL_SIZE)
                        .crop("fill")
                        .gravity("auto")
                        .quality("auto:good")
                        .fetchFormat("auto"))
                .secure(true)
                .generate(publicId);
    }

    private String generateMediumUrl(String publicId) {
        return cloudinary.url()
                .transformation(new Transformation()
                        .width(MEDIUM_WIDTH)
                        .crop("scale")
                        .quality("auto:good")
                        .fetchFormat("auto"))
                .secure(true)
                .generate(publicId);
    }

    private String generateOptimizedUrl(String publicId, Integer width, Integer height) {
        Transformation transformation = new Transformation()
                .quality(OPTIMIZED_QUALITY)
                .fetchFormat("auto");

        // Limit max dimensions for optimized version
        if (width != null && width > 1920) {
            transformation.width(1920).crop("scale");
        }

        return cloudinary.url()
                .transformation(transformation)
                .secure(true)
                .generate(publicId);
    }

    private void deleteFromCloudinary(String publicId) throws IOException {
        if (publicId != null && !publicId.isEmpty()) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }
}
