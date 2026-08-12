package com.campus.utility.repository;

import com.campus.utility.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByCollegeIdAndStudentIdOrderByCreatedAtDesc(Long collegeId, Long studentId);
    long countByCollegeIdAndStudentIdAndIsReadFalse(Long collegeId, Long studentId);
}
