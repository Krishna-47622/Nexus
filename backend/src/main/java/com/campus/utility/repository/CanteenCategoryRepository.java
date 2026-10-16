package com.campus.utility.repository;

import com.campus.utility.entity.CanteenCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CanteenCategoryRepository extends JpaRepository<CanteenCategory, Long> {
    List<CanteenCategory> findByCollegeIdOrderByDisplayOrderAsc(Long collegeId);
    Optional<CanteenCategory> findByCollegeIdAndName(Long collegeId, String name);
}
