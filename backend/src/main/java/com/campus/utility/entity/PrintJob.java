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

    private String status;
    private String paymentStatus;
    private String upiTxnRef;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
