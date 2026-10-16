package com.campus.utility.repository;

import com.campus.utility.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCollegeId(Long collegeId);
    Optional<Transaction> findByUpiTxnRef(String upiTxnRef);
    List<Transaction> findByCollegeIdAndStudentIdOrderByCreatedAtDesc(Long collegeId, Long studentId);
    List<Transaction> findByCollegeIdAndStatus(Long collegeId, String status);
    Optional<Transaction> findByCollegeIdAndReferenceId(Long collegeId, String referenceId);
}
