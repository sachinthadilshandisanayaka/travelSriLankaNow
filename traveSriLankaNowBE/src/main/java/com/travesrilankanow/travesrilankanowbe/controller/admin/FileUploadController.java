package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/image")
    @PreAuthorize("hasAuthority('MEDIA:CREATE')")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "travel-sri-lanka") String folder
    ) {
        try {
            Map<String, Object> result = cloudinaryService.uploadImage(file, folder);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Image uploaded successfully",
                    "data", result
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to upload image. Please try again."
            ));
        }
    }

    @PostMapping("/images")
    @PreAuthorize("hasAuthority('MEDIA:CREATE')")
    public ResponseEntity<Map<String, Object>> uploadMultipleImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folder", defaultValue = "travel-sri-lanka") String folder
    ) {
        List<Map<String, Object>> uploadedImages = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < files.length; i++) {
            try {
                Map<String, Object> result = cloudinaryService.uploadImage(files[i], folder);
                uploadedImages.add(result);
            } catch (Exception e) {
                errors.add("File " + (i + 1) + ": " + e.getMessage());
            }
        }

        if (uploadedImages.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "All uploads failed",
                    "errors", errors
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", uploadedImages.size() + " of " + files.length + " images uploaded successfully",
                "data", uploadedImages,
                "errors", errors
        ));
    }

    @DeleteMapping("/image")
    @PreAuthorize("hasAuthority('MEDIA:DELETE')")
    public ResponseEntity<Map<String, Object>> deleteImage(@RequestParam("publicId") String publicId) {
        try {
            cloudinaryService.deleteImage(publicId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Image deleted successfully"
            ));
        } catch (IOException e) {
            log.error("Error deleting image from Cloudinary: {}", publicId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to delete image"
            ));
        }
    }
}
