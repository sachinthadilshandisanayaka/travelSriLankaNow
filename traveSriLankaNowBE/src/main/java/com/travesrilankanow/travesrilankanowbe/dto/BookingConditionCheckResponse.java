package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookingConditionCheckResponse {
    private boolean canCancel;
    private String cancelReason;
    private boolean canEdit;
    private String editReason;
}
