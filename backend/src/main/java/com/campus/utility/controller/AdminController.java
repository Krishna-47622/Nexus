package com.campus.utility.controller;

import com.campus.utility.dto.AdminDTOs;
import com.campus.utility.dto.CanteenDTOs;
import com.campus.utility.dto.SportsDTOs;
import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import com.campus.utility.security.TenantContext;
import com.opencsv.CSVReader;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("isAuthenticated()")
@Transactional
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final MenuItemRepository menuItemRepository;
    private final CanteenCategoryRepository categoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final PrintPricingRepository printPricingRepository;
    private final OrderRepository orderRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final OutpassRequestRepository outpassRequestRepository;
    private final TransactionRepository transactionRepository;

    public AdminController(UserRepository userRepository,
                           RoleRepository roleRepository,
                           StudentRepository studentRepository,
                           CollegeRepository collegeRepository,
                           PasswordEncoder passwordEncoder,
                           MenuItemRepository menuItemRepository,
                           CanteenCategoryRepository categoryRepository,
                           EquipmentRepository equipmentRepository,
                           PrintPricingRepository printPricingRepository,
                           OrderRepository orderRepository,
                           BorrowRequestRepository borrowRequestRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           OutpassRequestRepository outpassRequestRepository,
                           TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.studentRepository = studentRepository;
        this.collegeRepository = collegeRepository;
        this.passwordEncoder = passwordEncoder;
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.printPricingRepository = printPricingRepository;
        this.orderRepository = orderRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.outpassRequestRepository = outpassRequestRepository;
        this.transactionRepository = transactionRepository;
    }

    private College resolveCollege(String email, Long tenantCollegeId) {
        if (tenantCollegeId != null) {
            Optional<College> col = collegeRepository.findById(tenantCollegeId);
            if (col.isPresent()) return col.get();
        }

        if (email != null && email.contains("@")) {
            String domain = email.substring(email.indexOf("@") + 1).trim();
            Optional<College> colByDomain = collegeRepository.findByDomain(domain);
            if (colByDomain.isPresent()) return colByDomain.get();

            String rawName = domain.split("\\.")[0];
            String collegeName = Character.toUpperCase(rawName.charAt(0)) + rawName.substring(1) + " Institution";
            try {
                return collegeRepository.save(College.builder().name(collegeName).domain(domain).build());
            } catch (Exception e) {
                List<College> all = collegeRepository.findAll();
                if (!all.isEmpty()) return all.get(0);
            }
        }

        List<College> all = collegeRepository.findAll();
        if (!all.isEmpty()) return all.get(0);

        return collegeRepository.save(College.builder().name("Main Campus").domain("campus.edu").build());
    }

    // --- Comprehensive User & Credentials Management ---
    @GetMapping("/users")
    public ResponseEntity<List<AdminDTOs.StaffAccountDTO>> getAllUsers(@RequestParam(required = false) String category) {
        Long collegeId = TenantContext.getCollegeId();
        List<User> users = (collegeId != null) ? userRepository.findByCollegeId(collegeId) : userRepository.findAll();

        List<AdminDTOs.StaffAccountDTO> list = users.stream()
                .filter(u -> {
                    if (category == null || category.isEmpty() || "ALL".equalsIgnoreCase(category)) return true;
                    String rName = u.getRoles().isEmpty() ? "User" : u.getRoles().iterator().next().getName();
                    return rName.equalsIgnoreCase(category);
                })
                .map(u -> {
                    String roleName = u.getRoles().isEmpty() ? "User" : u.getRoles().iterator().next().getName();
                    return AdminDTOs.StaffAccountDTO.builder()
                            .id(u.getId())
                            .username(u.getUsername())
                            .fullName(u.getFullName())
                            .email(u.getEmail())
                            .roleName(roleName)
                            .isActive(u.getIsActive())
                            .createdAt(u.getCreatedAt())
                            .build();
                }).collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    // --- Create Single Student Account ---
    @PostMapping("/students")
    public ResponseEntity<?> createStudentAccount(@RequestBody Map<String, String> body) {
        try {
            Long tenantCollegeId = TenantContext.getCollegeId();
            String rollNumber = body.get("rollNumber");
            String fullName = body.get("fullName");
            String email = body.get("email");
            String department = body.getOrDefault("department", "CSE");
            String year = body.getOrDefault("year", "1");
            String hostelBlock = body.getOrDefault("hostelBlock", "Day Scholar");
            String roomNumber = body.getOrDefault("roomNumber", "N/A");
            String password = body.get("password");

            if (rollNumber == null || rollNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Roll Number / Username is required"));
            }
            if (fullName == null || fullName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Full Name is required"));
            }
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email address is required"));
            }

            College college = resolveCollege(email, tenantCollegeId);

            Role studentRole = roleRepository.findByNameAndCollegeIsNull("Student")
                    .orElseGet(() -> roleRepository.findByName("Student")
                            .orElseGet(() -> roleRepository.save(Role.builder().name("Student").build())));

            if (userRepository.findByUsername(rollNumber.trim()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Account with Username / Roll Number '" + rollNumber + "' already exists"));
            }

            String initialPassword = (password != null && !password.trim().isEmpty()) ? password : "Pass" + UUID.randomUUID().toString().substring(0, 6);

            User user = User.builder()
                    .college(college)
                    .username(rollNumber.trim())
                    .fullName(fullName.trim())
                    .email(email.trim())
                    .passwordHash(passwordEncoder.encode(initialPassword))
                    .mustChangePassword(password == null || password.trim().isEmpty())
                    .isActive(true)
                    .roles(Set.of(studentRole))
                    .build();

            user = userRepository.save(user);

            Student student = Student.builder()
                    .user(user)
                    .college(college)
                    .rollNumber(rollNumber.trim())
                    .department(department)
                    .year(year)
                    .hostelBlock(hostelBlock)
                    .roomNumber(roomNumber)
                    .build();

            studentRepository.save(student);

            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "username", rollNumber,
                    "password", initialPassword,
                    "collegeName", college.getName(),
                    "message", "Student account created successfully for " + college.getName()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create student: " + e.getMessage()));
        }
    }

    // --- Edit User Details (Username, Full Name, Email, Role) ---
    @PutMapping("/users/{userId}/details")
    public ResponseEntity<?> updateUserDetails(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

            String newUsername = body.get("username");
            String newFullName = body.get("fullName");
            String newEmail = body.get("email");
            String newRoleName = body.get("roleName");

            if (newUsername != null && !newUsername.trim().isEmpty() && !newUsername.equals(user.getUsername())) {
                Optional<User> existing = userRepository.findByUsername(newUsername.trim());
                if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Username '" + newUsername + "' is already taken"));
                }
                user.setUsername(newUsername.trim());

                Optional<Student> studentOpt = studentRepository.findByUserId(user.getId());
                if (studentOpt.isPresent()) {
                    Student st = studentOpt.get();
                    st.setRollNumber(newUsername.trim());
                    studentRepository.save(st);
                }
            }

            if (newFullName != null && !newFullName.trim().isEmpty()) {
                user.setFullName(newFullName.trim());
            }

            if (newEmail != null && !newEmail.trim().isEmpty()) {
                user.setEmail(newEmail.trim());
            }

            if (newRoleName != null && !newRoleName.trim().isEmpty()) {
                Role role = roleRepository.findByNameAndCollegeIsNull(newRoleName)
                        .orElseGet(() -> roleRepository.findByName(newRoleName)
                                .orElseThrow(() -> new RuntimeException("Role not found: " + newRoleName)));
                user.setRoles(Set.of(role));
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "User details and username updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update user: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            String roleName = body.get("roleName");

            Role role = roleRepository.findByNameAndCollegeIsNull(roleName)
                    .orElseGet(() -> roleRepository.findByName(roleName)
                            .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)));

            user.setRoles(Set.of(role));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "User role updated successfully to " + roleName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/password")
    public ResponseEntity<?> changeUserPassword(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            String newPassword = body.get("newPassword");

            if (newPassword == null || newPassword.trim().length() < 4) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 4 characters"));
            }

            user.setPasswordHash(passwordEncoder.encode(newPassword));
            user.setMustChangePassword(false);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Credentials/password updated successfully for user " + user.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            user.setIsActive(!user.getIsActive());
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "User status updated to " + (user.getIsActive() ? "ACTIVE" : "DEACTIVATED"),
                    "isActive", user.getIsActive()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUserCredentials(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

            studentRepository.findByUserId(user.getId()).ifPresent(studentRepository::delete);
            userRepository.delete(user);

            return ResponseEntity.ok(Map.of("message", "User credentials & account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- Staff Management ---
    @GetMapping("/staff")
    public ResponseEntity<List<AdminDTOs.StaffAccountDTO>> getStaffAccounts() {
        Long collegeId = TenantContext.getCollegeId();
        List<User> users = (collegeId != null) ? userRepository.findByCollegeId(collegeId) : userRepository.findAll();

        List<AdminDTOs.StaffAccountDTO> list = users.stream()
                .filter(u -> u.getRoles().stream().noneMatch(r -> "Student".equalsIgnoreCase(r.getName())))
                .map(u -> {
                    String roleName = u.getRoles().isEmpty() ? "Staff" : u.getRoles().iterator().next().getName();
                    return AdminDTOs.StaffAccountDTO.builder()
                            .id(u.getId())
                            .username(u.getUsername())
                            .fullName(u.getFullName())
                            .email(u.getEmail())
                            .roleName(roleName)
                            .isActive(u.getIsActive())
                            .createdAt(u.getCreatedAt())
                            .build();
                }).collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    @PostMapping("/staff")
    public ResponseEntity<?> addStaffAccount(@RequestBody AdminDTOs.StaffAccountInput input) {
        try {
            Long tenantCollegeId = TenantContext.getCollegeId();
            College college = resolveCollege(input.getEmail(), tenantCollegeId);

            Role role = roleRepository.findByNameAndCollegeId(input.getRoleName(), college.getId())
                    .orElseGet(() -> roleRepository.findByNameAndCollegeIsNull(input.getRoleName())
                            .orElseThrow(() -> new RuntimeException("Role not found: " + input.getRoleName())));

            String username = input.getEmail().split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 4);
            String tempPassword = "Temp" + UUID.randomUUID().toString().substring(0, 6);

            User staff = User.builder()
                    .college(college)
                    .username(username)
                    .fullName(input.getFullName())
                    .email(input.getEmail())
                    .passwordHash(passwordEncoder.encode(tempPassword))
                    .mustChangePassword(true)
                    .isActive(true)
                    .roles(Set.of(role))
                    .build();

            userRepository.save(staff);

            return ResponseEntity.ok(Map.of(
                    "id", staff.getId(),
                    "username", username,
                    "tempPassword", tempPassword,
                    "message", "Staff account created. Temporary password generated."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- Bulk Student CSV Import ---
    @PostMapping("/students/import")
    public ResponseEntity<List<AdminDTOs.StudentImportRecord>> importStudentsCSV(@RequestParam("file") MultipartFile file) {
        Long tenantCollegeId = TenantContext.getCollegeId();
        College college = resolveCollege("import@campus.edu", tenantCollegeId);
        Role studentRole = roleRepository.findByNameAndCollegeIsNull("Student").orElseThrow();

        List<AdminDTOs.StudentImportRecord> results = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> lines = reader.readAll();
            boolean isHeader = true;

            for (String[] line : lines) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                if (line.length < 3 || line[0].trim().isEmpty()) continue;

                String rollNumber = line[0].trim();
                String fullName = line[1].trim();
                String email = line[2].trim();
                String department = line.length > 3 ? line[3].trim() : "General";
                String year = line.length > 4 ? line[4].trim() : "1";
                String hostelBlock = line.length > 5 ? line[5].trim() : "Day Scholar";
                String roomNumber = line.length > 6 ? line[6].trim() : "N/A";

                if (userRepository.existsByUsernameAndCollegeId(rollNumber, college.getId())) {
                    results.add(AdminDTOs.StudentImportRecord.builder()
                            .rollNumber(rollNumber).fullName(fullName).email(email)
                            .status("SKIPPED").error("Student with roll number already exists")
                            .build());
                    continue;
                }

                String tempPass = "Pass" + UUID.randomUUID().toString().substring(0, 6);

                User user = User.builder()
                        .college(college)
                        .username(rollNumber)
                        .fullName(fullName)
                        .email(email)
                        .passwordHash(passwordEncoder.encode(tempPass))
                        .mustChangePassword(true)
                        .isActive(true)
                        .roles(Set.of(studentRole))
                        .build();

                userRepository.save(user);

                Student student = Student.builder()
                        .user(user)
                        .college(college)
                        .rollNumber(rollNumber)
                        .department(department)
                        .year(year)
                        .hostelBlock(hostelBlock)
                        .roomNumber(roomNumber)
                        .build();

                studentRepository.save(student);

                results.add(AdminDTOs.StudentImportRecord.builder()
                        .rollNumber(rollNumber)
                        .fullName(fullName)
                        .email(email)
                        .department(department)
                        .year(year)
                        .hostelBlock(hostelBlock)
                        .roomNumber(roomNumber)
                        .tempPassword(tempPass)
                        .status("SUCCESS")
                        .build());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(results);
    }

    // --- Catalog Management ---
    @PostMapping("/catalog/canteen/item")
    public ResponseEntity<?> addMenuItem(@RequestBody CanteenDTOs.MenuItemDTO dto) {
        Long tenantCollegeId = TenantContext.getCollegeId();
        College college = resolveCollege("canteen@campus.edu", tenantCollegeId);

        CanteenCategory category;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseGet(() -> categoryRepository.save(CanteenCategory.builder().college(college).name("Main Menu").displayOrder(1).build()));
        } else {
            category = categoryRepository.save(CanteenCategory.builder().college(college).name("Main Menu").displayOrder(1).build());
        }

        MenuItem item = MenuItem.builder()
                .college(college)
                .category(category)
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .isVeg(Boolean.TRUE.equals(dto.getIsVeg()))
                .isAvailable(Boolean.TRUE.equals(dto.getIsAvailable()))
                .imageUrl(dto.getImageUrl())
                .build();

        menuItemRepository.save(item);
        return ResponseEntity.ok(Map.of("message", "Menu item added", "id", item.getId()));
    }

    @PostMapping("/catalog/sports/equipment")
    public ResponseEntity<?> addEquipment(@RequestBody SportsDTOs.EquipmentDTO dto) {
        Long tenantCollegeId = TenantContext.getCollegeId();
        College college = resolveCollege("sports@campus.edu", tenantCollegeId);

        Equipment eq = Equipment.builder()
                .college(college)
                .name(dto.getName())
                .category(dto.getCategory())
                .totalQty(dto.getTotalQty())
                .availableQty(dto.getTotalQty())
                .lateFineRatePerDay(dto.getLateFineRatePerDay())
                .isActive(true)
                .build();

        equipmentRepository.save(eq);
        return ResponseEntity.ok(Map.of("message", "Equipment added", "id", eq.getId()));
    }

    @PutMapping("/catalog/print/pricing")
    public ResponseEntity<?> updatePrintPricing(@RequestBody Map<String, BigDecimal> body) {
        Long tenantCollegeId = TenantContext.getCollegeId();
        College college = resolveCollege("print@campus.edu", tenantCollegeId);

        PrintPricing pricing = printPricingRepository.findByCollegeId(college.getId())
                .orElseGet(() -> PrintPricing.builder().college(college).build());

        if (body.containsKey("bwPerPage")) pricing.setBwPerPage(body.get("bwPerPage"));
        if (body.containsKey("colorPerPage")) pricing.setColorPerPage(body.get("colorPerPage"));

        printPricingRepository.save(pricing);
        return ResponseEntity.ok(Map.of("message", "Print pricing updated"));
    }

    // --- Analytics ---
    @GetMapping("/analytics")
    public ResponseEntity<AdminDTOs.AnalyticsDTO> getCollegeAnalytics() {
        Long collegeId = TenantContext.getCollegeId();
        if (collegeId == null) {
            List<College> cols = collegeRepository.findAll();
            if (!cols.isEmpty()) collegeId = cols.get(0).getId();
        }

        long totalStudents = collegeId != null ? studentRepository.countByCollegeId(collegeId) : studentRepository.count();
        long activeOrders = collegeId != null ? orderRepository.countByCollegeIdAndStatusIn(collegeId, List.of("PLACED", "PREPARING", "READY")) : orderRepository.count();
        long pendingApprovals = collegeId != null ? (borrowRequestRepository.countByCollegeIdAndStatus(collegeId, "PENDING")
                + leaveRequestRepository.countByCollegeIdAndStatus(collegeId, "PENDING")
                + outpassRequestRepository.countByCollegeIdAndStatus(collegeId, "PENDING")) : 0;

        List<Transaction> paidTxns = collegeId != null ? transactionRepository.findByCollegeIdAndStatus(collegeId, "PAID") : transactionRepository.findAll();
        BigDecimal totalRev = paidTxns.stream()
                .map(Transaction::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        AdminDTOs.AnalyticsDTO analytics = AdminDTOs.AnalyticsDTO.builder()
                .totalStudents(totalStudents)
                .activeOrdersToday(activeOrders)
                .pendingApprovals(pendingApprovals)
                .totalRevenueMonth(totalRev)
                .topMenuItems(List.of(
                        new AdminDTOs.CategoryStat("Masala Dosa", 142L),
                        new AdminDTOs.CategoryStat("Cold Coffee", 98L),
                        new AdminDTOs.CategoryStat("Veg Thali", 76L)
                ))
                .topEquipmentBorrows(List.of(
                        new AdminDTOs.CategoryStat("Badminton Racket", 64L),
                        new AdminDTOs.CategoryStat("Football", 45L),
                        new AdminDTOs.CategoryStat("Basketball", 31L)
                ))
                .build();

        return ResponseEntity.ok(analytics);
    }
}