package com.campus.utility.repository;

import com.campus.utility.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCollegeId(Long collegeId);
    List<Order> findByCollegeIdAndStudentIdOrderByCreatedAtDesc(Long collegeId, Long studentId);
    List<Order> findByCollegeIdAndStudentIdAndStatusIn(Long collegeId, Long studentId, List<String> statuses);
    List<Order> findByCollegeIdAndStatusIn(Long collegeId, List<String> statuses);
    Optional<Order> findByOrderNumber(String orderNumber);
    long countByCollegeIdAndStatusIn(Long collegeId, List<String> statuses);
}
