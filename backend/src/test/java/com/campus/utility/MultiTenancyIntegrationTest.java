package com.campus.utility;

import com.campus.utility.entity.College;
import com.campus.utility.entity.User;
import com.campus.utility.repository.CollegeRepository;
import com.campus.utility.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MultiTenancyIntegrationTest {

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void testPlatformAdminSeeded() {
        assertTrue(userRepository.findByUsername("admin").isPresent(), "Platform Admin should be seeded on startup");
        User admin = userRepository.findByUsername("admin").get();
        assertTrue(passwordEncoder.matches("1234", admin.getPasswordHash()), "Seeded password should match bcrypt hash for 1234");
    }

    @Test
    public void testCollegeDataIsolation() {
        College collegeA = collegeRepository.save(College.builder().name("College A").domain("collegea.edu").build());
        College collegeB = collegeRepository.save(College.builder().name("College B").domain("collegeb.edu").build());

        User userA = userRepository.save(User.builder()
                .username("student101")
                .passwordHash("pass")
                .email("student101@collegea.edu")
                .fullName("Student One")
                .college(collegeA)
                .build());
        User userB = userRepository.save(User.builder()
                .username("student102")
                .passwordHash("pass")
                .email("student102@collegeb.edu")
                .fullName("Student Two")
                .college(collegeB)
                .build());

        assertTrue(userRepository.findByUsernameAndCollegeId("student101", collegeA.getId()).isPresent());
        assertEquals(collegeA.getId(), userRepository.findByUsernameAndCollegeId("student101", collegeA.getId()).get().getCollege().getId());
    }
}
