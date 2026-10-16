package com.campus.utility.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CanteenDTOs {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CategoryDTO {
        private Long id;
        private String name;
        private Integer displayOrder;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MenuItemDTO {
        private Long id;
        private Long categoryId;
        private String categoryName;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal sellingPrice;
        private BigDecimal basePrice;
        private BigDecimal taxValue;
        private BigDecimal taxPercent;
        private String istharaItemId;
        private String istharaVendorId;
        private Boolean isVeg;
        private Boolean isAvailable;
        private String imageUrl;
        private String vendorName;
    }

    @Data
    public static class OrderItemRequest {
        private Long menuItemId;
        private Integer quantity;
    }

    @Data
    public static class OrderRequest {
        private List<OrderItemRequest> items;
        private String paymentMethod;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrderItemDTO {
        private Long id;
        private Long menuItemId;
        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrderDTO {
        private Long id;
        private String orderNumber;
        private String studentName;
        private String rollNumber;
        private String status;
        private BigDecimal totalAmount;
        private String paymentStatus;
        private String upiTxnRef;
        private String upiIntentUrl;
        private List<OrderItemDTO> items;
        private LocalDateTime createdAt;
    }
}
