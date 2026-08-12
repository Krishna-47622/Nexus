package com.campus.utility.controller;

import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import com.campus.utility.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository,
                                  StudentRepository studentRepository,
                                  UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMyNotifications() {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();

        List<Notification> list = notificationRepository.findByCollegeIdAndStudentIdOrderByCreatedAtDesc(collegeId, student.getId());
        List<Map<String, Object>> result = list.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("module", n.getModule());
            map.put("title", n.getTitle());
            map.put("message", n.getMessage());
            map.put("isRead", n.getIsRead());
            map.put("createdAt", n.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setIsRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }
}
