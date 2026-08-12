package com.campus.utility.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @Column(nullable = false)
    private String name;

    private String category;
    private Integer totalQty;
    private Integer availableQty;

    @Column(precision = 10, scale = 2)
    private BigDecimal lateFineRatePerDay;

    @Builder.Default
    private Boolean isActive = true;

    @Version
    private Long version;
}
