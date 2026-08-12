package com.campus.utility.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SportsDTOs {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class EquipmentDTO {
        private Long id;
        private String name;
        private String category;
        private Integer totalQty;
        private Integer availableQty;
        private BigDecimal lateFineRatePerDay;
        private Boolean isActive;
    }

    @Data
    public static class BorrowRequestInput {
        private Long equipmentId;
        private LocalDateTime expectedReturnAt;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class BorrowRequestDTO {
        private Long id;
        private Long equipmentId;
        private String equipmentName;
        private String category;
        private String studentName;
        private String rollNumber;
        private LocalDateTime expectedReturnAt;
        private String status;
        private LocalDateTime approvedAt;
        private LocalDateTime returnedAt;
        private BigDecimal fineAmount;
        private Boolean finePaid;
        private String upiTxnRef;
        private String upiIntentUrl;
        private String remarks;
        private LocalDateTime createdAt;
    }

    @Data
    public static class ProcessBorrowRequest {
        private String action;
        private String remarks;
    }
}
