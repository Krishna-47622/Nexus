package com.campus.utility.repository;

import com.campus.utility.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    Optional<Role> findByNameAndCollegeId(String name, Long collegeId);
    Optional<Role> findByNameAndCollegeIsNull(String name);
    List<Role> findByCollegeIdOrCollegeIsNull(Long collegeId);
}
