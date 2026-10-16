package com.campus.utility.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "print_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrintPricing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    // Base per-page rates
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal bwPerPage = new BigDecimal("2.00");

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal colorPerPage = new BigDecimal("10.00");

    // Paper size multipliers (applied to per-page rate)
    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal a4Multiplier = new BigDecimal("1.00");

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal a3Multiplier = new BigDecimal("2.00");

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal letterMultiplier = new BigDecimal("1.00");

    // Double-sided discount percentage (e.g. 10 means 10% off)
    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal doubleSidedDiscountPercent = new BigDecimal("10.00");

    // Binding / Spiral charge (flat per-job)
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal bindingCharge = new BigDecimal("30.00");

    // Urgent / express surcharge percentage
    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal urgentSurchargePercent = new BigDecimal("25.00");

    // Printer Shop Guy & Location details
    @Builder.Default
    private String printerShopName = "Campus Reprographics & Digital Print Center";

    @Builder.Default
    private String printerContactPerson = "Ramesh Kumar (Print Operator)";

    @Builder.Default
    private String printerPhone = "+91 98490 12345";

    @Builder.Default
    private String printerWhatsapp = "919849012345";

    @Builder.Default
    private String printerShopLocation = "Engineering Block 2, Ground Floor (Adjacent to MR Food Court)";

    @Builder.Default
    private String printerUpiId = "printshop@mallareddyuniversity.ac.in";
}

