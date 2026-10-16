package com.campus.utility.controller;

import com.campus.utility.dto.AuthDTOs;
import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import com.campus.utility.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@Transactional(readOnly = true)
public class AuthController {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final StudentRepository studentRepository;

    public AuthController(UserRepository userRepository,
                          CollegeRepository collegeRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider,
                          StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "nexus-backend"));
    }

    @GetMapping("/colleges")
    public ResponseEntity<List<AuthDTOs.CollegeResponse>> getColleges() {
        List<College> colleges = collegeRepository.findAll();
        List<AuthDTOs.CollegeResponse> list = colleges.stream().map(c -> AuthDTOs.CollegeResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .domain(c.getDomain())
                .logoUrl(c.getLogoUrl())
                .address(c.getAddress())
                .studentCount(studentRepository.countByCollegeId(c.getId()))
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTOs.LoginRequest request) {
        String inputUser = request.getUsername() != null ? request.getUsername().trim() : "";
        Optional<User> userOpt = Optional.empty();

        // 1. If collegeId was explicitly provided, try username + college
        if (request.getCollegeId() != null) {
            userOpt = userRepository.findByUsernameAndCollegeId(inputUser, request.getCollegeId());
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmailAndCollegeId(inputUser, request.getCollegeId());
            }
        }

        // 2. If input looks like an email, resolve college by domain and try
        if (userOpt.isEmpty() && inputUser.contains("@")) {
            String domain = inputUser.substring(inputUser.indexOf("@") + 1);
            Optional<College> collegeOpt = collegeRepository.findByDomain(domain);
            if (collegeOpt.isPresent()) {
                Long cId = collegeOpt.get().getId();
                // Try full email as username
                userOpt = userRepository.findByUsernameAndCollegeId(inputUser, cId);
                // Try email field
                if (userOpt.isEmpty()) {
                    userOpt = userRepository.findByEmailAndCollegeId(inputUser, cId);
                }
                // Try local part (e.g. "admin" from "admin@domain.com") as username
                if (userOpt.isEmpty()) {
                    String localPart = inputUser.substring(0, inputUser.indexOf("@"));
                    userOpt = userRepository.findByUsernameAndCollegeId(localPart, cId);
                }
            }
            // Also try email globally (no college filter)
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(inputUser);
            }
        }

        // 3. Fallback: try as global username (for platform admin etc.)
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(inputUser);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Account not found for username/email: " + inputUser));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid password"));
        }

        if (!user.getIsActive()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Account is deactivated"));
        }

        return createLoginResponse(user);
    }

    @PostMapping("/platform-login")
    public ResponseEntity<?> platformLogin(@RequestBody AuthDTOs.LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid platform admin credentials"));
        }

        User user = userOpt.get();
        if (user.getCollege() != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not a platform admin account"));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid password"));
        }

        return createLoginResponse(user);
    }

    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestBody AuthDTOs.SetPasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current temporary password is incorrect"));
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    private ResponseEntity<?> createLoginResponse(User user) {
        Set<Permission> allPermissions = new HashSet<>();
        List<String> roleNames = new ArrayList<>();
        List<GrantedAuthority> authorities = new ArrayList<>();

        for (Role role : user.getRoles()) {
            roleNames.add(role.getName());
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase().replace(" ", "_")));
            authorities.add(new SimpleGrantedAuthority(role.getName()));
            allPermissions.addAll(role.getPermissions());
        }

        for (Permission p : allPermissions) {
            authorities.add(new SimpleGrantedAuthority(p.getCode()));
        }

        Long collegeId = user.getCollege() != null ? user.getCollege().getId() : null;
        String collegeName = user.getCollege() != null ? user.getCollege().getName() : "Platform Global";

        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), collegeId, authorities);

        String primaryRole = roleNames.isEmpty() ? "User" : roleNames.get(0);
        List<String> permCodes = allPermissions.stream().map(Permission::getCode).collect(Collectors.toList());

        AuthDTOs.LoginResponse response = AuthDTOs.LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .collegeId(collegeId)
                .collegeName(collegeName)
                .primaryRole(primaryRole)
                .mustChangePassword(user.getMustChangePassword())
                .permissions(permCodes)
                .build();

        return ResponseEntity.ok(response);
    }
}
