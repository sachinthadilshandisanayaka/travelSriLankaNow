package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing a media file (image) in the system.
 * Provides centralized tracking of all uploaded images with metadata.
 */
@Entity
@Table(name = "media", indexes = {
    @Index(name = "idx_media_type", columnList = "mediaType"),
    @Index(name = "idx_media_public_id", columnList = "publicId"),
    @Index(name = "idx_media_status", columnList = "isActive")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Original filename as uploaded by the user
     */
    @Column(nullable = false)
    private String originalFilename;

    /**
     * Cloudinary public ID for managing the image
     */
    @Column(nullable = false, unique = true)
    private String publicId;

    /**
     * Full URL to the original uploaded image
     */
    @Column(nullable = false, length = 1000)
    private String url;

    /**
     * URL to the optimized/compressed version
     */
    @Column(length = 1000)
    private String optimizedUrl;

    /**
     * URL to the thumbnail version (150x150)
     */
    @Column(length = 1000)
    private String thumbnailUrl;

    /**
     * URL to medium-sized version (600px width)
     */
    @Column(length = 1000)
    private String mediumUrl;

    /**
     * Type/usage category of the media
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaType mediaType;

    /**
     * Image format (jpg, png, webp, gif)
     */
    @Column(length = 20)
    private String format;

    /**
     * Original image width in pixels
     */
    private Integer width;

    /**
     * Original image height in pixels
     */
    private Integer height;

    /**
     * File size in bytes
     */
    private Long fileSize;

    /**
     * Alt text for accessibility
     */
    @Column(length = 500)
    private String altText;

    /**
     * Caption/description for the image
     */
    @Column(length = 1000)
    private String caption;

    /**
     * Cloudinary folder where the image is stored
     */
    @Column(length = 255)
    private String folder;

    /**
     * Reference to the entity using this media (optional)
     * Format: "entity_type:entity_id" (e.g., "location:5", "event:12")
     */
    @Column(length = 100)
    private String entityReference;

    /**
     * Whether this media is actively in use
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    /**
     * Sort order for gallery/collection displays
     */
    @Builder.Default
    private Integer sortOrder = 0;

    /**
     * Crop data stored as JSON for re-editing
     * Format: {"x":0,"y":0,"width":100,"height":100,"aspect":"16:9"}
     */
    @Column(columnDefinition = "TEXT")
    private String cropData;

    /**
     * Transformation data stored as JSON
     * Format: {"rotate":90,"filters":["brightness:1.2"]}
     */
    @Column(columnDefinition = "TEXT")
    private String transformationData;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * User who uploaded this media (optional tracking)
     */
    @Column(length = 100)
    private String uploadedBy;
}
