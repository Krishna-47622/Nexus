package com.campus.utility.repository;

import com.campus.utility.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCollegeId(Long collegeId);
    List<MenuItem> findByCollegeIdAndIsAvailableTrue(Long collegeId);
    List<MenuItem> findByCollegeIdAndCategoryId(Long collegeId, Long categoryId);
}
