package com.campus.utility.repository;

import com.campus.utility.entity.OutpassRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OutpassRequestRepository extends JpaRepository<OutpassRequest, Long> {
    List<OutpassRequest> findByCollegeId(Long collegeId);
    List<OutpassRequest> findByCollegeIdAndStudentIdOrderByCreatedAtDesc(Long collegeId, Long studentId);
    List<OutpassRequest> findByCollegeIdAndStatusOrderByCreatedAtAsc(Long collegeId, String status);
    long countByCollegeIdAndStatus(Long collegeId, String status);
}
