package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class BookingCalendarDay {
    private LocalDate date;
    private long totalBookings;
    private long pendingCount;
    private long confirmedCount;
    private long completedCount;
    private List<BookingAdminResponse> bookings;
}
