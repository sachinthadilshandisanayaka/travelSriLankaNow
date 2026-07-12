package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceTemplateDto {
    private Long id;
    private Long companyId;
    private String companyName;
    private String name;
    private String description;
    private String templateUrl;
    private Integer version;
    private Boolean isActive;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private List<AssignmentDto> assignments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentDto {
        private Long assignmentId;
        private Long companyId;
        private String companyName;
        private Boolean isActive;
        private LocalDateTime assignedAt;
        private String assignedBy;
    }
}
