package com.campus.utility.repository;

import com.campus.utility.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameAndCollegeId(String username, Long collegeId);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndCollegeId(String email, Long collegeId);
    List<User> findByCollegeId(Long collegeId);
    boolean existsByUsernameAndCollegeId(String username, Long collegeId);
}
