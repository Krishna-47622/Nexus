package com.campus.utility.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "print_jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrintJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String fileUrl;
    private String fileName;

    @Builder.Default
    private Integer copies = 1;

    @Builder.Default
    private Boolean isColor = false;

    @Builder.Default
    private Boolean isDoubleSided = false;

    @Builder.Default
    private String paperSize = "A4";

    @Builder.Default
    private Integer totalPages = 1;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalCost;

    // Price breakdown stored per job for historical accuracy
    @Column(precision = 10, scale = 2)
    private BigDecimal perPageRate;

    @Column(precision = 5, scale = 2)
    private BigDecimal paperSizeMultiplier;

    @Column(precision = 10, scale = 2)
    private BigDecimal doubleSidedDiscount;

    @Column(precision = 10, scale = 2)
    private BigDecimal bindingCharge;

    @Column(precision = 10, scale = 2)
    private BigDecimal urgentSurcharge;

    @Builder.Default
    private Boolean isUrgent = false;

    @Builder.Default
    private Boolean needsBinding = false;

    // Conditions and Specifications
    @Builder.Default
    private String orientation = "PORTRAIT";

    @Builder.Default
    private String paperQuality = "STANDARD_75GSM";

    @Builder.Default
    private String pageRange = "ALL";

    @Column(length = 1000)
    private String specialInstructions;

    // Payment: PAY_NOW vs PAY_ON_COLLECTION
    @Builder.Default
    private String paymentMethod = "PAY_NOW";

    private String status;
    private String paymentStatus;
    private String upiTxnRef;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
