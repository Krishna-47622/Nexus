package com.campus.utility.repository;

import com.campus.utility.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByRollNumberAndCollegeId(String rollNumber, Long collegeId);
    List<Student> findByCollegeId(Long collegeId);
    long countByCollegeId(Long collegeId);
}
