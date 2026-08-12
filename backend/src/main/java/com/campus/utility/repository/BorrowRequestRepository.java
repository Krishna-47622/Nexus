package com.campus.utility.repository;

import com.campus.utility.entity.BorrowRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {
    List<BorrowRequest> findByCollegeId(Long collegeId);
    List<BorrowRequest> findByCollegeIdAndStudentIdOrderByCreatedAtDesc(Long collegeId, Long studentId);
    List<BorrowRequest> findByCollegeIdAndStudentIdAndStatusIn(Long collegeId, Long studentId, List<String> statuses);
    List<BorrowRequest> findByCollegeIdAndStatus(Long collegeId, String status);
    List<BorrowRequest> findByCollegeIdAndStatusIn(Long collegeId, List<String> statuses);
    long countByCollegeIdAndStatus(Long collegeId, String status);
}
