package com.campus.utility.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PrintDTOs {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PrintPricingDTO {
        private BigDecimal bwPerPage;
        private BigDecimal colorPerPage;
    }

    @Data
    public static class PrintJobInput {
        private String fileUrl;
        private String fileName;
        private Integer copies;
        private Boolean isColor;
        private Boolean isDoubleSided;
        private String paperSize;
        private Integer totalPages;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PrintJobDTO {
        private Long id;
        private String studentName;
        private String rollNumber;
        private String fileUrl;
        private String fileName;
        private Integer copies;
        private Boolean isColor;
        private Boolean isDoubleSided;
        private String paperSize;
        private Integer totalPages;
        private BigDecimal totalCost;
        private String status;
        private String paymentStatus;
        private String upiTxnRef;
        private String upiIntentUrl;
        private LocalDateTime createdAt;
    }
}
