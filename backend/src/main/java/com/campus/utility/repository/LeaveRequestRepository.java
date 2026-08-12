package com.campus.utility.repository;

import com.campus.utility.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByCollegeId(Long collegeId);
    List<LeaveRequest> findByCollegeIdAndStudentIdOrderByCreatedAtDesc(Long collegeId, Long studentId);
    List<LeaveRequest> findByCollegeIdAndStatusOrderByCreatedAtAsc(Long collegeId, String status);
    long countByCollegeIdAndStatus(Long collegeId, String status);
}
