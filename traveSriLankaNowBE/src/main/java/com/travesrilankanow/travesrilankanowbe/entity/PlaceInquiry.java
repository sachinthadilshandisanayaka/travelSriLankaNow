package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "place_inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long placeId;

    @Column(nullable = false)
    private String visitorName;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Column(name = "check_in_date")
    private LocalDate checkInDate;

    @Column(name = "check_out_date")
    private LocalDate checkOutDate;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    @Column(name = "preferred_time")
    private String preferredTime;

    @Column(name = "party_size")
    private Integer partySize;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "inquiry_date", nullable = false)
    private LocalDateTime inquiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InquiryStatus status = InquiryStatus.NEW;

    public enum InquiryStatus { NEW, RESPONDED, CLOSED }
}
