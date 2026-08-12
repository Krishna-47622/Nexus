package com.campus.utility.repository;

import com.campus.utility.entity.PrintPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PrintPricingRepository extends JpaRepository<PrintPricing, Long> {
    Optional<PrintPricing> findByCollegeId(Long collegeId);
}
