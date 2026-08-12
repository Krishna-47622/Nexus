package com.campus.utility.repository;

import com.campus.utility.entity.PrintJob;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrintJobRepository extends JpaRepository<PrintJob, Long> {
    List<PrintJob> findByCollegeId(Long collegeId);
    List<PrintJob> findByCollegeIdAndStudentIdOrderByCreatedAtDesc(Long collegeId, Long studentId);
    List<PrintJob> findByCollegeIdAndStudentIdAndStatusIn(Long collegeId, Long studentId, List<String> statuses);
    List<PrintJob> findByCollegeIdAndStatusInOrderByCreatedAtAsc(Long collegeId, List<String> statuses);
    long countByCollegeIdAndStatusIn(Long collegeId, List<String> statuses);
}
