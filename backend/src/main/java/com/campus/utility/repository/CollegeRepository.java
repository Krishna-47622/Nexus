package com.campus.utility.repository;

import com.campus.utility.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CollegeRepository extends JpaRepository<College, Long> {
    Optional<College> findByDomain(String domain);
}
