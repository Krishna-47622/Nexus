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
        private BigDecimal a4Multiplier;
        private BigDecimal a3Multiplier;
        private BigDecimal letterMultiplier;
        private BigDecimal doubleSidedDiscountPercent;
        private BigDecimal bindingCharge;
        private BigDecimal urgentSurchargePercent;
        private String printerShopName;
        private String printerContactPerson;
        private String printerPhone;
        private String printerWhatsapp;
        private String printerShopLocation;
        private String printerUpiId;
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
        private Boolean isUrgent;
        private Boolean needsBinding;
        private String orientation;
        private String paperQuality;
        private String pageRange;
        private String specialInstructions;
        private String paymentMethod; // "PAY_NOW" or "PAY_ON_COLLECTION"
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
        // Price breakdown fields
        private BigDecimal perPageRate;
        private BigDecimal paperSizeMultiplier;
        private BigDecimal doubleSidedDiscount;
        private BigDecimal bindingCharge;
        private BigDecimal urgentSurcharge;
        private Boolean isUrgent;
        private Boolean needsBinding;
        // Conditions & Instructions
        private String orientation;
        private String paperQuality;
        private String pageRange;
        private String specialInstructions;
        private String paymentMethod;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DocumentAnalysisResult {
        private Integer detectedPages;
        private String fileType;
        private Long fileSizeBytes;
        private Boolean hasColorContent;
        private BigDecimal estimatedCost;
        private BigDecimal perPageRate;
        private BigDecimal paperSizeMultiplier;
    }

    @Data
    public static class PricingUpdateInput {
        private BigDecimal bwPerPage;
        private BigDecimal colorPerPage;
        private BigDecimal a4Multiplier;
        private BigDecimal a3Multiplier;
        private BigDecimal letterMultiplier;
        private BigDecimal doubleSidedDiscountPercent;
        private BigDecimal bindingCharge;
        private BigDecimal urgentSurchargePercent;
        private String printerShopName;
        private String printerContactPerson;
        private String printerPhone;
        private String printerWhatsapp;
        private String printerShopLocation;
        private String printerUpiId;
    }
}
