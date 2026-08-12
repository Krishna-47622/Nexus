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

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal bwPerPage = new BigDecimal("2.00");

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal colorPerPage = new BigDecimal("10.00");
}
