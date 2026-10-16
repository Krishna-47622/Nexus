package com.campus.utility.controller;

import com.campus.utility.dto.AdminDTOs;
import com.campus.utility.dto.AuthDTOs;
import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@Transactional
@RequestMapping("/api/v1/platform-admin")
@PreAuthorize("hasAuthority('PLATFORM_MANAGE_COLLEGES') or hasAuthority('PLATFORM_MANAGE_IAM') or hasAuthority('PLATFORM_VIEW_GLOBAL_OVERVIEW')")
public class PlatformAdminController {

    private final CollegeRepository collegeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public PlatformAdminController(CollegeRepository collegeRepository,
                                  UserRepository userRepository,
                                  RoleRepository roleRepository,
                                  PermissionRepository permissionRepository,
                                  StudentRepository studentRepository,
                                  PasswordEncoder passwordEncoder) {
        this.collegeRepository = collegeRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
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

    @PostMapping("/colleges")
    public ResponseEntity<?> createCollege(@RequestBody AdminDTOs.CollegeCreateInput input) {
        if (collegeRepository.findByDomain(input.getDomain()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "College domain already registered"));
        }

        College college = College.builder()
                .name(input.getName())
                .domain(input.getDomain())
                .logoUrl(input.getLogoUrl())
                .address(input.getAddress())
                .build();

        collegeRepository.save(college);

        Role collegeAdminRole = roleRepository.findByNameAndCollegeIsNull("College Admin")
                .orElseThrow(() -> new RuntimeException("College Admin role template missing"));

        String adminUsername = "admin_" + input.getDomain().replace(".", "_");
        String tempPass = "CollegeAdmin" + UUID.randomUUID().toString().substring(0, 4);

        User collegeAdmin = User.builder()
                .college(college)
                .username(adminUsername)
                .fullName(input.getAdminName() != null ? input.getAdminName() : input.getName() + " Admin")
                .email(input.getAdminEmail() != null ? input.getAdminEmail() : "admin@" + input.getDomain())
                .passwordHash(passwordEncoder.encode(tempPass))
                .mustChangePassword(true)
                .isActive(true)
                .roles(Set.of(collegeAdminRole))
                .build();

        userRepository.save(collegeAdmin);

        return ResponseEntity.ok(Map.of(
                "collegeId", college.getId(),
                "collegeName", college.getName(),
                "adminUsername", adminUsername,
                "adminTempPassword", tempPass,
                "message", "College onboarded successfully. Initial admin account provisioned."
        ));
    }

    // --- IAM Roles & Permissions Matrix ---
    @GetMapping("/iam/roles")
    public ResponseEntity<List<AdminDTOs.RoleDTO>> getRoles() {
        List<Role> roles = roleRepository.findAll();
        List<AdminDTOs.RoleDTO> dtos = roles.stream().map(r -> AdminDTOs.RoleDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .permissions(r.getPermissions().stream().map(Permission::getCode).collect(Collectors.toList()))
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/iam/permissions")
    public ResponseEntity<List<Permission>> getPermissions() {
        return ResponseEntity.ok(permissionRepository.findAll());
    }

    @PostMapping("/iam/roles")
    public ResponseEntity<?> createRole(@RequestBody Map<String, Object> body) {
        String name = (String) (body.containsKey("name") ? body.get("name") : body.get("roleName"));
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role name is required"));
        }

        @SuppressWarnings("unchecked")
        List<String> permCodes = (List<String>) (body.containsKey("permissions") ? body.get("permissions") : body.get("permissionCodes"));

        Set<Permission> perms = new HashSet<>();
        if (permCodes != null) {
            for (String code : permCodes) {
                permissionRepository.findByCode(code).ifPresent(perms::add);
            }
        }

        Role role = Role.builder()
                .name(name.trim())
                .college(null)
                .permissions(perms)
                .build();

        roleRepository.save(role);
        return ResponseEntity.ok(Map.of("message", "Role created", "id", role.getId()));
    }

    @PutMapping("/iam/roles/{roleId}")
    public ResponseEntity<?> updateRole(@PathVariable Long roleId, @RequestBody Map<String, Object> body) {
        Role role = roleRepository.findById(roleId).orElseThrow(() -> new RuntimeException("Role not found"));
        if (body.containsKey("name")) role.setName((String) body.get("name"));
        if (body.containsKey("roleName")) role.setName((String) body.get("roleName"));

        @SuppressWarnings("unchecked")
        List<String> permCodes = (List<String>) (body.containsKey("permissions") ? body.get("permissions") : body.get("permissionCodes"));
        if (permCodes != null) {
            Set<Permission> perms = new HashSet<>();
            for (String code : permCodes) {
                permissionRepository.findByCode(code).ifPresent(perms::add);
            }
            role.setPermissions(perms);
        }

        roleRepository.save(role);
        return ResponseEntity.ok(Map.of("message", "Role updated successfully", "id", role.getId()));
    }

    @PostMapping("/colleges/{collegeId}/assign-admin")
    public ResponseEntity<?> assignCollegeAdmin(@PathVariable Long collegeId, @RequestBody Map<String, String> body) {
        College college = collegeRepository.findById(collegeId).orElseThrow(() -> new RuntimeException("College not found"));
        String username = body.get("username");
        String email = body.get("email");
        String fullName = body.get("fullName");
        String password = body.getOrDefault("password", "Admin" + UUID.randomUUID().toString().substring(0, 6));

        Role collegeAdminRole = roleRepository.findByNameAndCollegeIsNull("College Admin")
                .orElseThrow(() -> new RuntimeException("College Admin role template missing"));

        User collegeAdmin = User.builder()
                .college(college)
                .username(username != null ? username.trim() : "admin_" + college.getDomain().replace(".", "_"))
                .fullName(fullName != null ? fullName.trim() : college.getName() + " Administrator")
                .email(email != null ? email.trim() : "admin@" + college.getDomain())
                .passwordHash(passwordEncoder.encode(password))
                .mustChangePassword(true)
                .isActive(true)
                .roles(Set.of(collegeAdminRole))
                .build();

        userRepository.save(collegeAdmin);
        return ResponseEntity.ok(Map.of("message", "Admin assigned successfully", "username", collegeAdmin.getUsername(), "tempPassword", password));
    }

    // --- Global Overview ---
    @GetMapping("/overview")
    public ResponseEntity<AdminDTOs.PlatformOverviewDTO> getOverview() {
        long totalColleges = collegeRepository.count();
        long totalStudents = studentRepository.count();
        long totalStaff = userRepository.count() - totalStudents - 1;

        List<College> colleges = collegeRepository.findAll();
        List<AuthDTOs.CollegeResponse> collegeResponses = colleges.stream().map(c -> AuthDTOs.CollegeResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .domain(c.getDomain())
                .logoUrl(c.getLogoUrl())
                .address(c.getAddress())
                .studentCount(studentRepository.countByCollegeId(c.getId()))
                .build()).collect(Collectors.toList());

        AdminDTOs.PlatformOverviewDTO overview = AdminDTOs.PlatformOverviewDTO.builder()
                .totalColleges(totalColleges)
                .totalStudentsPlatform(totalStudents)
                .totalStaffPlatform(Math.max(0, totalStaff))
                .systemHealth("100% Operational (H2 Embedded Database)")
                .colleges(collegeResponses)
                .build();

        return ResponseEntity.ok(overview);
    }
}
