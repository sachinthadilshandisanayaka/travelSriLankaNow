package com.travesrilankanow.travesrilankanowbe.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        validateFile(file);

        Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image",
                "overwrite", true,
                "unique_filename", true
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);

        log.info("Image uploaded successfully to Cloudinary: {}", uploadResult.get("secure_url"));

        return Map.of(
                "url", uploadResult.get("secure_url"),
                "publicId", uploadResult.get("public_id"),
                "width", uploadResult.get("width"),
                "height", uploadResult.get("height"),
                "format", uploadResult.get("format"),
                "bytes", uploadResult.get("bytes")
        );
    }

    public void deleteImage(String publicId) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        log.info("Image deleted from Cloudinary: {} - Result: {}", publicId, result.get("result"));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File too large. Maximum size is 10MB"
            );
        }
    }

    public String getOptimizedUrl(String url, Integer width, Integer height, Integer quality) {
        if (url == null || !url.contains("cloudinary.com")) {
            return url;
        }

        StringBuilder transformations = new StringBuilder();
        transformations.append("q_").append(quality != null ? quality : 80);
        transformations.append(",f_auto");

        if (width != null) {
            transformations.append(",w_").append(width);
        }
        if (height != null) {
            transformations.append(",h_").append(height);
        }
        transformations.append(",c_fill");

        String[] parts = url.split("/upload/");
        if (parts.length == 2) {
            return parts[0] + "/upload/" + transformations + "/" + parts[1];
        }

        return url;
    }
}
