package com.travesrilankanow.travesrilankanowbe.service;

import io.minio.*;
import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.public-url}")
    private String publicUrl;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        validateFile(file);

        String ext = getExtension(file.getOriginalFilename(), file.getContentType());
        String objectKey = (folder != null && !folder.isBlank() ? folder.replaceAll("^/+|/+$", "") + "/" : "")
                + UUID.randomUUID() + "." + ext;

        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
        } catch (MinioException | IllegalArgumentException e) {
            throw new IOException("MinIO upload failed: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new IOException("Upload failed: " + e.getMessage(), e);
        }

        String url = buildUrl(objectKey);
        log.info("Image uploaded to MinIO: {}", url);

        return Map.of(
                "url", url,
                "publicId", objectKey,
                "width", 0,
                "height", 0,
                "format", ext,
                "bytes", file.getSize()
        );
    }

    public void deleteImage(String objectKey) throws IOException {
        if (objectKey == null || objectKey.isBlank()) return;
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .build());
            log.info("Deleted from MinIO: {}", objectKey);
        } catch (MinioException | IllegalArgumentException e) {
            throw new IOException("MinIO delete failed: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new IOException("Delete failed: " + e.getMessage(), e);
        }
    }

    public String extractPublicId(String url) {
        if (url == null || url.isBlank()) return null;
        try {
            // URL pattern: {publicUrl}/{bucket}/{objectKey}
            String prefix = publicUrl.replaceAll("/+$", "") + "/" + bucketName + "/";
            if (url.startsWith(prefix)) {
                return url.substring(prefix.length());
            }
            // Also handle localhost URL patterns when publicUrl differs at runtime
            if (url.contains("/" + bucketName + "/")) {
                int idx = url.indexOf("/" + bucketName + "/");
                return url.substring(idx + bucketName.length() + 2);
            }
        } catch (Exception e) {
            log.warn("Failed to extract object key from URL: {}", url);
        }
        return null;
    }

    public void deleteImageByUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;
        String objectKey = extractPublicId(imageUrl);
        if (objectKey != null) {
            try {
                deleteImage(objectKey);
            } catch (Exception e) {
                log.warn("Failed to delete image from MinIO: {} - {}", imageUrl, e.getMessage());
            }
        } else {
            log.debug("Skipping delete — could not resolve object key from URL: {}", imageUrl);
        }
    }

    public void deleteImagesByUrls(List<String> imageUrls) {
        if (imageUrls != null) {
            imageUrls.forEach(this::deleteImageByUrl);
        }
    }

    // No server-side transformations with MinIO — returns original URL unchanged.
    public String getOptimizedUrl(String url, Integer width, Integer height, Integer quality) {
        return url;
    }

    /** Upload raw bytes with an explicit object key (used for image variants). */
    public String uploadBytes(byte[] data, String objectKey, String contentType) throws IOException {
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .stream(new java.io.ByteArrayInputStream(data), data.length, -1)
                    .contentType(contentType)
                    .build());
        } catch (MinioException | IllegalArgumentException e) {
            throw new IOException("MinIO upload failed: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new IOException("Upload failed: " + e.getMessage(), e);
        }
        return buildUrl(objectKey);
    }

    // --- helpers ---

    public String buildUrl(String objectKey) {
        return publicUrl.replaceAll("/+$", "") + "/" + bucketName + "/" + objectKey;
    }

    private String getExtension(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        }
        if (contentType != null) {
            return switch (contentType) {
                case "image/jpeg" -> "jpg";
                case "image/png" -> "png";
                case "image/gif" -> "gif";
                case "image/webp" -> "webp";
                default -> "jpg";
            };
        }
        return "jpg";
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: JPEG, PNG, GIF, WebP");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File too large. Maximum size is 10MB");
        }
    }
}
