package com.travesrilankanow.travesrilankanowbe.service;

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
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaService {

    private final CloudinaryService storageService;
    private final MediaRepository mediaRepository;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final int THUMBNAIL_SIZE = 150;
    private static final int MEDIUM_WIDTH = 600;
    private static final int OPTIMIZED_MAX_WIDTH = 1920;

    private static final Map<MediaType, String> FOLDER_MAP = Map.of(
            MediaType.HERO_SLIDE, "travel-sri-lanka/hero-slides",
            MediaType.PAGE_HEADER, "travel-sri-lanka/page-headers",
            MediaType.LOCATION, "travel-sri-lanka/locations",
            MediaType.LOCATION_GALLERY, "travel-sri-lanka/locations/gallery",
            MediaType.EVENT, "travel-sri-lanka/events",
            MediaType.PLACE, "travel-sri-lanka/places",
            MediaType.PLACE_GALLERY, "travel-sri-lanka/places/gallery",
            MediaType.GALLERY, "travel-sri-lanka/gallery",
            MediaType.GENERAL, "travel-sri-lanka/general"
    );

    @Transactional
    public Media uploadImage(MultipartFile file, MediaType mediaType, String altText, String caption) throws IOException {
        validateFile(file);

        String folder = FOLDER_MAP.getOrDefault(mediaType, "travel-sri-lanka/general");

        // Read image dimensions
        BufferedImage bufferedImage = ImageIO.read(file.getInputStream());
        int originalWidth = bufferedImage != null ? bufferedImage.getWidth() : 0;
        int originalHeight = bufferedImage != null ? bufferedImage.getHeight() : 0;

        // Upload original
        Map<String, Object> uploadResult = storageService.uploadImage(file, folder);
        String objectKey = (String) uploadResult.get("publicId");
        String url = (String) uploadResult.get("url");
        String format = (String) uploadResult.get("format");
        long bytes = ((Number) uploadResult.get("bytes")).longValue();

        // Generate and upload variant images
        String thumbnailUrl = generateAndUploadVariant(file, bufferedImage, folder, objectKey, "thumb",
                THUMBNAIL_SIZE, THUMBNAIL_SIZE, true);
        String mediumUrl = generateAndUploadVariant(file, bufferedImage, folder, objectKey, "medium",
                MEDIUM_WIDTH, 0, false);
        String optimizedUrl = (originalWidth > OPTIMIZED_MAX_WIDTH)
                ? generateAndUploadVariant(file, bufferedImage, folder, objectKey, "optimized",
                OPTIMIZED_MAX_WIDTH, 0, false)
                : url;

        Media media = Media.builder()
                .originalFilename(file.getOriginalFilename())
                .publicId(objectKey)
                .url(url)
                .optimizedUrl(optimizedUrl)
                .thumbnailUrl(thumbnailUrl)
                .mediumUrl(mediumUrl)
                .mediaType(mediaType)
                .format(format)
                .width(originalWidth > 0 ? originalWidth : null)
                .height(originalHeight > 0 ? originalHeight : null)
                .fileSize(bytes)
                .altText(altText)
                .caption(caption)
                .folder(folder)
                .isActive(true)
                .sortOrder(0)
                .build();

        return mediaRepository.save(media);
    }

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

    @Transactional
    public Media uploadWithTransformation(
            MultipartFile file, MediaType mediaType,
            Integer cropX, Integer cropY, Integer cropWidth, Integer cropHeight,
            Integer rotate, String altText) throws IOException {
        validateFile(file);

        String folder = FOLDER_MAP.getOrDefault(mediaType, "travel-sri-lanka/general");

        BufferedImage original = ImageIO.read(file.getInputStream());
        if (original == null) throw new IOException("Could not read image file");

        // Apply crop
        if (cropX != null && cropY != null && cropWidth != null && cropHeight != null) {
            original = original.getSubimage(cropX, cropY, cropWidth, cropHeight);
        }

        // Apply rotation
        if (rotate != null && rotate != 0) {
            original = rotateImage(original, rotate);
        }

        // Convert back to bytes for upload
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        String fmt = getFormatName(file.getContentType());
        ImageIO.write(original, fmt, baos);
        byte[] transformedBytes = baos.toByteArray();

        MultipartFile transformedFile = new ByteArrayMultipartFile(
                transformedBytes, file.getOriginalFilename(), file.getContentType());

        Map<String, Object> uploadResult = storageService.uploadImage(transformedFile, folder);
        String objectKey = (String) uploadResult.get("publicId");
        String url = (String) uploadResult.get("url");
        String format = (String) uploadResult.get("format");
        long bytes = ((Number) uploadResult.get("bytes")).longValue();

        String cropData = null;
        if (cropX != null) {
            cropData = String.format("{\"x\":%d,\"y\":%d,\"width\":%d,\"height\":%d}",
                    cropX, cropY, cropWidth, cropHeight);
        }
        String transformationData = (rotate != null && rotate != 0)
                ? String.format("{\"rotate\":%d}", rotate) : null;

        Media media = Media.builder()
                .originalFilename(file.getOriginalFilename())
                .publicId(objectKey)
                .url(url)
                .optimizedUrl(url)
                .thumbnailUrl(generateAndUploadVariant(transformedFile, original, folder, objectKey, "thumb",
                        THUMBNAIL_SIZE, THUMBNAIL_SIZE, true))
                .mediumUrl(generateAndUploadVariant(transformedFile, original, folder, objectKey, "medium",
                        MEDIUM_WIDTH, 0, false))
                .mediaType(mediaType)
                .format(format)
                .width(original.getWidth())
                .height(original.getHeight())
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

    @Transactional
    public Media replaceImage(Long mediaId, MultipartFile file) throws IOException {
        Media existing = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media not found with ID: " + mediaId));

        deleteAllVariants(existing);

        Media newMedia = uploadImage(file, existing.getMediaType(), existing.getAltText(), existing.getCaption());
        newMedia.setEntityReference(existing.getEntityReference());
        newMedia.setSortOrder(existing.getSortOrder());

        mediaRepository.delete(existing);
        return mediaRepository.save(newMedia);
    }

    @Transactional
    public Media updateMetadata(Long id, String altText, String caption, Integer sortOrder) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found with ID: " + id));
        if (altText != null) media.setAltText(altText);
        if (caption != null) media.setCaption(caption);
        if (sortOrder != null) media.setSortOrder(sortOrder);
        return mediaRepository.save(media);
    }

    @Transactional
    public void linkToEntity(Long mediaId, String entityType, Long entityId) {
        mediaRepository.updateEntityReference(mediaId, entityType + ":" + entityId);
    }

    @Transactional
    public void unlinkFromEntity(Long mediaId) {
        mediaRepository.updateEntityReference(mediaId, null);
    }

    public Optional<Media> getById(Long id) {
        return mediaRepository.findById(id);
    }

    public Optional<Media> getByPublicId(String publicId) {
        return mediaRepository.findByPublicId(publicId);
    }

    public Optional<Media> getByUrl(String url) {
        return mediaRepository.findByUrl(url);
    }

    public List<Media> getByType(MediaType type) {
        return mediaRepository.findByMediaTypeAndIsActiveTrueOrderBySortOrderAsc(type);
    }

    public Page<Media> getByTypePaginated(MediaType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return mediaRepository.findByMediaType(type, pageable);
    }

    public Page<Media> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return mediaRepository.findByIsActiveTrue(pageable);
    }

    public Page<Media> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return mediaRepository.searchMedia(query, pageable);
    }

    public List<Media> getRecentUploads() {
        return mediaRepository.findTop20ByOrderByCreatedAtDesc();
    }

    public List<Media> getForEntity(String entityType, Long entityId) {
        return mediaRepository.findByEntityReferenceOrderBySortOrderAsc(entityType + ":" + entityId);
    }

    @Transactional
    public void delete(Long id) throws IOException {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found with ID: " + id));
        deleteAllVariants(media);
        mediaRepository.delete(media);
        log.info("Deleted media: {} ({})", media.getOriginalFilename(), media.getPublicId());
    }

    @Transactional
    public void softDelete(Long id) {
        mediaRepository.softDelete(id);
    }

    @Transactional
    public int cleanupUnusedMedia(int daysOld) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysOld);
        List<Media> unusedMedia = mediaRepository.findUnusedMediaOlderThan(cutoff);
        int count = 0;
        for (Media media : unusedMedia) {
            try {
                deleteAllVariants(media);
                mediaRepository.delete(media);
                count++;
            } catch (Exception e) {
                log.error("Failed to delete unused media: {}", media.getPublicId(), e);
            }
        }
        log.info("Cleaned up {} unused media files older than {} days", count, daysOld);
        return count;
    }

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

    // Returns original URL — MinIO does not support on-the-fly transformations.
    public String getTransformedUrl(String publicId, Integer width, Integer height, Integer quality, String crop) {
        return storageService.buildUrl(publicId);
    }

    // --- private helpers ---

    private void deleteAllVariants(Media media) {
        storageService.deleteImageByUrl(media.getUrl());
        if (media.getThumbnailUrl() != null && !media.getThumbnailUrl().equals(media.getUrl()))
            storageService.deleteImageByUrl(media.getThumbnailUrl());
        if (media.getMediumUrl() != null && !media.getMediumUrl().equals(media.getUrl()))
            storageService.deleteImageByUrl(media.getMediumUrl());
        if (media.getOptimizedUrl() != null && !media.getOptimizedUrl().equals(media.getUrl()))
            storageService.deleteImageByUrl(media.getOptimizedUrl());
    }

    private String generateAndUploadVariant(MultipartFile originalFile, BufferedImage bufferedImage,
                                             String folder, String baseKey, String suffix,
                                             int targetWidth, int targetHeight, boolean square) {
        try {
            if (bufferedImage == null) {
                bufferedImage = ImageIO.read(originalFile.getInputStream());
                if (bufferedImage == null) return storageService.buildUrl(baseKey);
            }

            BufferedImage resized = resizeImage(bufferedImage, targetWidth, targetHeight, square);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            String fmt = getFormatName(originalFile.getContentType());
            ImageIO.write(resized, fmt, baos);

            // Derive variant key: insert _suffix before the extension
            String variantKey = baseKey.replaceAll("(\\.[^./]+)$", "_" + suffix + "$1");
            return storageService.uploadBytes(baos.toByteArray(), variantKey, originalFile.getContentType());
        } catch (Exception e) {
            log.warn("Failed to generate {} variant for {}: {}", suffix, baseKey, e.getMessage());
            return storageService.buildUrl(baseKey);
        }
    }

    private BufferedImage resizeImage(BufferedImage src, int targetWidth, int targetHeight, boolean square) {
        int srcW = src.getWidth();
        int srcH = src.getHeight();

        if (square) {
            int cropSize = Math.min(srcW, srcH);
            int cropX = (srcW - cropSize) / 2;
            int cropY = (srcH - cropSize) / 2;
            src = src.getSubimage(cropX, cropY, cropSize, cropSize);
            srcW = srcH = cropSize;
            Image img = src.getScaledInstance(targetWidth, targetWidth, Image.SCALE_SMOOTH);
            BufferedImage result = new BufferedImage(targetWidth, targetWidth, BufferedImage.TYPE_INT_RGB);
            result.getGraphics().drawImage(img, 0, 0, null);
            return result;
        }

        // Scale width, maintain aspect ratio
        double ratio = (double) targetWidth / srcW;
        int newH = (int) (srcH * ratio);
        if (newH < 1) newH = 1;
        Image img = src.getScaledInstance(targetWidth, newH, Image.SCALE_SMOOTH);
        BufferedImage result = new BufferedImage(targetWidth, newH, BufferedImage.TYPE_INT_RGB);
        result.getGraphics().drawImage(img, 0, 0, null);
        return result;
    }

    private BufferedImage rotateImage(BufferedImage src, int degrees) {
        double rad = Math.toRadians(degrees);
        double sin = Math.abs(Math.sin(rad));
        double cos = Math.abs(Math.cos(rad));
        int newW = (int) Math.floor(src.getWidth() * cos + src.getHeight() * sin);
        int newH = (int) Math.floor(src.getHeight() * cos + src.getWidth() * sin);
        BufferedImage result = new BufferedImage(newW, newH, src.getType());
        Graphics2D g2d = result.createGraphics();
        g2d.translate((newW - src.getWidth()) / 2, (newH - src.getHeight()) / 2);
        g2d.rotate(rad, src.getWidth() / 2.0, src.getHeight() / 2.0);
        g2d.drawRenderedImage(src, null);
        g2d.dispose();
        return result;
    }

    private String getFormatName(String contentType) {
        if (contentType == null) return "jpg";
        return switch (contentType) {
            case "image/png" -> "png";
            case "image/gif" -> "gif";
            case "image/webp" -> "jpg"; // fallback: Java ImageIO doesn't write WebP natively
            default -> "jpg";
        };
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is empty or null");
        if (file.getSize() > MAX_FILE_SIZE)
            throw new IllegalArgumentException("File too large. Maximum size is 10MB");
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_CONTENT_TYPES.contains(ct))
            throw new IllegalArgumentException("Invalid file type. Allowed types: JPEG, PNG, GIF, WebP");
    }

    // Minimal MultipartFile wrapper for in-memory bytes
    private record ByteArrayMultipartFile(byte[] bytes, String filename, String contentType)
            implements MultipartFile {
        public String getName() { return "file"; }
        public String getOriginalFilename() { return filename; }
        public String getContentType() { return contentType; }
        public boolean isEmpty() { return bytes == null || bytes.length == 0; }
        public long getSize() { return bytes == null ? 0 : bytes.length; }
        public byte[] getBytes() { return bytes; }
        public java.io.InputStream getInputStream() { return new ByteArrayInputStream(bytes); }
        public void transferTo(java.io.File dest) throws IOException {
            try (var os = new java.io.FileOutputStream(dest)) { os.write(bytes); }
        }
    }
}
