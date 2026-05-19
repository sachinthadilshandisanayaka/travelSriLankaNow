package com.travesrilankanow.travesrilankanowbe.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingEditRequest {
    private String participantName;
    private String phone;
    @Min(1)
    private Integer numberOfPeople;
    private String specialRequests;
    private LocalDate requestedDate;
    private Boolean termsAccepted;
}
