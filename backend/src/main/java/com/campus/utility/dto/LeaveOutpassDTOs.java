package com.campus.utility.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveOutpassDTOs {

    @Data
    public static class LeaveInput {
        private String reason;
        private LocalDate fromDate;
        private LocalDate toDate;
        private String destination;
        private String attachmentUrl;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LeaveRequestDTO {
        private Long id;
        private String studentName;
        private String rollNumber;
        private String hostelBlock;
        private String roomNumber;
        private String reason;
        private LocalDate fromDate;
        private LocalDate toDate;
        private String destination;
        private String attachmentUrl;
        private String status;
        private String wardenRemarks;
        private LocalDateTime createdAt;
    }

    @Data
    public static class OutpassInput {
        private String type;
        private LocalDateTime outTime;
        private LocalDateTime expectedReturnTime;
        private String destinationPurpose;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OutpassRequestDTO {
        private Long id;
        private String studentName;
        private String rollNumber;
        private String hostelBlock;
        private String roomNumber;
        private String type;
        private LocalDateTime outTime;
        private LocalDateTime expectedReturnTime;
        private LocalDateTime actualReturnTime;
        private String destinationPurpose;
        private String status;
        private String wardenRemarks;
        private LocalDateTime createdAt;
    }

    @Data
    public static class ReviewDecision {
        private String action;
        private String remarks;
    }
}
