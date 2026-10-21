package com.campus.utility.service;

import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final CanteenCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final EquipmentRepository equipmentRepository;
    private final PrintPricingRepository printPricingRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(PermissionRepository permissionRepository,
                      RoleRepository roleRepository,
                      UserRepository userRepository,
                      CollegeRepository collegeRepository,
                      CanteenCategoryRepository categoryRepository,
                      MenuItemRepository menuItemRepository,
                      EquipmentRepository equipmentRepository,
                      PrintPricingRepository printPricingRepository,
                      StudentRepository studentRepository,
                      PasswordEncoder passwordEncoder) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.equipmentRepository = equipmentRepository;
        this.printPricingRepository = printPricingRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedPermissionsAndRoles();
        seedPlatformAdmin();
        seedDefaultCollegeData();
    }

    private void seedPermissionsAndRoles() {
        Map<String, String[]> modulePermissions = Map.of(
            "canteen", new String[]{"view_menu", "manage_menu", "place_order", "update_order_status"},
            "sports", new String[]{"view_equipment", "manage_equipment", "request_borrow", "approve_borrow", "mark_returned"},
            "print", new String[]{"submit_job", "manage_pricing", "view_queue", "update_job_status"},
            "leave_outpass", new String[]{"submit_request", "view_requests", "approve_reject_request"},
            "admin", new String[]{"manage_staff", "manage_students", "view_analytics"},
            "platform", new String[]{"manage_colleges", "manage_iam", "view_global_overview"}
        );

        Map<String, Permission> permMap = new HashMap<>();

        modulePermissions.forEach((module, actions) -> {
            for (String action : actions) {
                String code = (module + "_" + action).toUpperCase();
                Permission perm = permissionRepository.findByCode(code)
                    .orElseGet(() -> permissionRepository.save(Permission.builder()
                        .module(module)
                        .action(action)
                        .code(code)
                        .build()));
                permMap.put(code, perm);
            }
        });

        createRoleIfAbsent("Platform Admin", permMap.values());
        createRoleIfAbsent("College Admin", getPerms(permMap, "CANTEEN_MANAGE_MENU", "SPORTS_MANAGE_EQUIPMENT", "PRINT_MANAGE_PRICING", "ADMIN_MANAGE_STAFF", "ADMIN_MANAGE_STUDENTS", "ADMIN_VIEW_ANALYTICS"));
        createRoleIfAbsent("Canteen Staff", getPerms(permMap, "CANTEEN_VIEW_MENU", "CANTEEN_MANAGE_MENU", "CANTEEN_UPDATE_ORDER_STATUS"));
        createRoleIfAbsent("Sports Room Staff", getPerms(permMap, "SPORTS_VIEW_EQUIPMENT", "SPORTS_MANAGE_EQUIPMENT", "SPORTS_APPROVE_BORROW", "SPORTS_MARK_RETURNED"));
        createRoleIfAbsent("Print Shop Staff", getPerms(permMap, "PRINT_VIEW_QUEUE", "PRINT_UPDATE_JOB_STATUS"));
        createRoleIfAbsent("Warden", getPerms(permMap, "LEAVE_OUTPASS_APPROVE_REJECT_REQUEST", "LEAVE_OUTPASS_VIEW_REQUESTS"));
        createRoleIfAbsent("Student", getPerms(permMap, "CANTEEN_VIEW_MENU", "CANTEEN_PLACE_ORDER", "SPORTS_VIEW_EQUIPMENT", "SPORTS_REQUEST_BORROW", "PRINT_SUBMIT_JOB", "LEAVE_OUTPASS_SUBMIT_REQUEST", "LEAVE_OUTPASS_VIEW_REQUESTS"));

        roleRepository.findByNameAndCollegeIsNull("Sports Room Staff").ifPresent(role -> {
            Permission managePerm = permMap.get("SPORTS_MANAGE_EQUIPMENT");
            if (managePerm != null && (role.getPermissions() == null || !role.getPermissions().contains(managePerm))) {
                if (role.getPermissions() == null) {
                    role.setPermissions(new HashSet<>());
                }
                role.getPermissions().add(managePerm);
                roleRepository.save(role);
            }
        });

        roleRepository.findByNameAndCollegeIsNull("Canteen Staff").ifPresent(role -> {
            Permission managePerm = permMap.get("CANTEEN_MANAGE_MENU");
            if (managePerm != null && (role.getPermissions() == null || !role.getPermissions().contains(managePerm))) {
                if (role.getPermissions() == null) {
                    role.setPermissions(new HashSet<>());
                }
                role.getPermissions().add(managePerm);
                roleRepository.save(role);
            }
        });
    }

    private Collection<Permission> getPerms(Map<String, Permission> permMap, String... codes) {
        Set<Permission> set = new HashSet<>();
        for (String code : codes) {
            if (permMap.containsKey(code)) {
                set.add(permMap.get(code));
            }
        }
        return set;
    }

    private void createRoleIfAbsent(String name, Collection<Permission> permissions) {
        if (roleRepository.findByNameAndCollegeIsNull(name).isEmpty()) {
            Role role = Role.builder()
                .name(name)
                .college(null) // global template
                .permissions(new HashSet<>(permissions))
                .build();
            roleRepository.save(role);
        }
    }

    private void seedPlatformAdmin() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role platformAdminRole = roleRepository.findByNameAndCollegeIsNull("Platform Admin")
                .orElseThrow(() -> new RuntimeException("Platform Admin role missing"));

            User admin = User.builder()
                .username("admin")
                .passwordHash(passwordEncoder.encode("1234"))
                .fullName("System Platform Administrator")
                .email("admin@platform.campus.edu")
                .isActive(true)
                .mustChangePassword(false)
                .roles(Set.of(platformAdminRole))
                .college(null)
                .build();

            userRepository.save(admin);
        }
    }

    private void seedDefaultCollegeData() {
        Optional<College> existingDefaultCollege = collegeRepository.findByDomain("mallareddyuniversity.ac.in");
        if (existingDefaultCollege.isPresent()) {
            College mru = existingDefaultCollege.get();
            seedDemoAccounts(mru);
            seedMRFoodCourtMenu(mru);
            seedPrintPricing(mru);
            return;
        }

        if (collegeRepository.count() == 0) {
            College mru = collegeRepository.save(College.builder()
                    .name("Malla Reddy University")
                    .domain("mallareddyuniversity.ac.in")
                    .logoUrl("https://images.unsplash.com/photo-1562774053-701939374585?w=100")
                    .address("Maisammaguda, Dulapally, Hyderabad, Telangana 500100")
                    .build());

            // Default College Admin
            Role adminRole = roleRepository.findByNameAndCollegeIsNull("College Admin").orElseThrow();
            userRepository.save(User.builder()
                    .college(mru)
                    .username("admin_mallareddyuniversity_ac_in")
                    .fullName("Malla Reddy Admin")
                    .email("admin@mallareddyuniversity.ac.in")
                    .passwordHash(passwordEncoder.encode("1234"))
                    .isActive(true)
                    .mustChangePassword(false)
                    .roles(Set.of(adminRole))
                    .build());

            seedDemoAccounts(mru);
            seedMRFoodCourtMenu(mru);

            // Default Equipment
            equipmentRepository.save(Equipment.builder().college(mru).name("Badminton Racket Set").category("Badminton").totalQty(15).availableQty(15).lateFineRatePerDay(new BigDecimal("10.00")).isActive(true).build());
            equipmentRepository.save(Equipment.builder().college(mru).name("Tournament Football").category("Football").totalQty(10).availableQty(10).lateFineRatePerDay(new BigDecimal("15.00")).isActive(true).build());

            seedPrintPricing(mru);
        }
    }

    private void seedPrintPricing(College college) {
        if (printPricingRepository.findByCollegeId(college.getId()).isEmpty()) {
            printPricingRepository.save(PrintPricing.builder()
                    .college(college)
                    .bwPerPage(new BigDecimal("2.00"))
                    .colorPerPage(new BigDecimal("10.00"))
                    .a4Multiplier(new BigDecimal("1.00"))
                    .a3Multiplier(new BigDecimal("2.00"))
                    .letterMultiplier(new BigDecimal("1.00"))
                    .doubleSidedDiscountPercent(new BigDecimal("10.00"))
                    .bindingCharge(new BigDecimal("30.00"))
                    .urgentSurchargePercent(new BigDecimal("25.00"))
                    .printerShopName("Campus Reprographics & Digital Print Center")
                    .printerContactPerson("Ramesh Kumar (Print Operator)")
                    .printerPhone("+91 98490 12345")
                    .printerWhatsapp("919849012345")
                    .printerShopLocation("Engineering Block 2, Ground Floor (Adjacent to MR Food Court)")
                    .printerUpiId("9398979155-1@superyes")
                    .build());
        }
    }

    private void seedMRFoodCourtMenu(College mru) {
        List<MenuItem> existing = menuItemRepository.findByCollegeId(mru.getId());
        if (existing.size() >= 190 && existing.stream().allMatch(i -> i.getIstharaItemId() != null && i.getSellingPrice() != null)) {
            return; // Up to date with authentic Isthara items and prices
        }

        try (java.io.InputStream is = getClass().getResourceAsStream("/mr_foodcourt_menu.json")) {
            if (is == null) {
                System.err.println("mr_foodcourt_menu.json not found in classpath!");
                return;
            }
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<Map<String, Object>> items = mapper.readValue(is, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});

            // Fetch and map existing categories
            List<CanteenCategory> existingCats = categoryRepository.findByCollegeIdOrderByDisplayOrderAsc(mru.getId());
            Map<String, CanteenCategory> categoryMap = new HashMap<>();
            for (CanteenCategory cat : existingCats) {
                categoryMap.put(cat.getName().toLowerCase().trim(), cat);
            }

            // Map existing menu items by Isthara item ID, and fallback by lower-cased name
            Map<String, MenuItem> existingByIstharaId = new HashMap<>();
            Map<String, MenuItem> existingByName = new HashMap<>();
            for (MenuItem mi : existing) {
                if (mi.getIstharaItemId() != null) {
                    existingByIstharaId.put(mi.getIstharaItemId(), mi);
                }
                existingByName.put(mi.getName().toLowerCase().trim(), mi);
            }

            int catOrder = categoryMap.size() + 1;
            List<MenuItem> toSave = new ArrayList<>();

            for (Map<String, Object> raw : items) {
                String catName = toStringVal(raw.get("categoryName"), "Food Court Specials");
                CanteenCategory category = categoryMap.get(catName.toLowerCase().trim());
                if (category == null) {
                    category = categoryRepository.save(CanteenCategory.builder()
                            .college(mru)
                            .name(catName)
                            .displayOrder(catOrder++)
                            .build());
                    categoryMap.put(catName.toLowerCase().trim(), category);
                }

                String istharaItemId = toStringVal(raw.get("istharaItemId"), null);
                String istharaVendorId = toStringVal(raw.get("istharaVendorId"), null);
                String name = toStringVal(raw.get("name"), "Food Item");
                String desc = toStringVal(raw.get("description"), "MR Food Court - 1 live item");
                String vendorName = toStringVal(raw.get("vendorName"), "MR Food Court");
                String imageUrl = toStringVal(raw.get("imageUrl"), null);
                BigDecimal sellingPrice = toBigDecimal(raw.get("sellingPrice"));
                BigDecimal price = sellingPrice;
                BigDecimal basePrice = toBigDecimal(raw.get("basePrice"));
                BigDecimal taxValue = toBigDecimal(raw.get("taxValue"));
                BigDecimal taxPercent = toBigDecimal(raw.get("taxPercent"));
                Boolean isVeg = toBoolean(raw.get("isVeg"), true);

                MenuItem item = null;
                if (istharaItemId != null && existingByIstharaId.containsKey(istharaItemId)) {
                    item = existingByIstharaId.get(istharaItemId);
                } else if (existingByName.containsKey(name.toLowerCase().trim())) {
                    item = existingByName.get(name.toLowerCase().trim());
                }

                if (item != null) {
                    item.setCategory(category);
                    item.setName(name);
                    item.setDescription(desc);
                    item.setPrice(price);
                    item.setSellingPrice(sellingPrice);
                    item.setBasePrice(basePrice);
                    item.setTaxValue(taxValue);
                    item.setTaxPercent(taxPercent);
                    item.setIstharaItemId(istharaItemId);
                    item.setIstharaVendorId(istharaVendorId);
                    item.setVendorName(vendorName);
                    item.setImageUrl(imageUrl);
                    item.setIsVeg(isVeg);
                    item.setIsAvailable(true);
                    toSave.add(item);
                } else {
                    MenuItem newItem = MenuItem.builder()
                            .college(mru)
                            .category(category)
                            .name(name)
                            .description(desc)
                            .price(price)
                            .sellingPrice(sellingPrice)
                            .basePrice(basePrice)
                            .taxValue(taxValue)
                            .taxPercent(taxPercent)
                            .istharaItemId(istharaItemId)
                            .istharaVendorId(istharaVendorId)
                            .vendorName(vendorName)
                            .imageUrl(imageUrl)
                            .isVeg(isVeg)
                            .isAvailable(true)
                            .build();
                    toSave.add(newItem);
                }
            }

            menuItemRepository.saveAll(toSave);
            System.out.println(">>> Successfully seeded " + toSave.size() + " authentic MR Food Court menu items from Isthara!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private BigDecimal toBigDecimal(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal) return (BigDecimal) obj;
        if (obj instanceof Number) return BigDecimal.valueOf(((Number) obj).doubleValue());
        try {
            return new BigDecimal(obj.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private Boolean toBoolean(Object obj, boolean def) {
        if (obj == null) return def;
        if (obj instanceof Boolean) return (Boolean) obj;
        return Boolean.parseBoolean(obj.toString());
    }

    private String toStringVal(Object obj, String def) {
        return obj != null && !obj.toString().trim().isEmpty() ? obj.toString().trim() : def;
    }

    private void seedDemoAccounts(College college) {
        seedDemoStudent(college);
        seedDemoStaffAccount(college, "canteen_staff", "Canteen Staff", "Canteen Staff");
        seedDemoStaffAccount(college, "sports_staff", "Sports Room Staff", "Sports Room Staff");
        seedDemoStaffAccount(college, "print_staff", "Print Shop Staff", "Print Shop Staff");
        seedDemoStaffAccount(college, "warden", "Hostel Warden", "Warden");
    }

    private void seedDemoStaffAccount(College college, String username, String fullName, String roleName) {
        if (userRepository.findByUsernameAndCollegeId(username, college.getId()).isPresent()) {
            return;
        }

        Role role = roleRepository.findByNameAndCollegeIsNull(roleName).orElseThrow();
        userRepository.save(User.builder()
                .college(college)
                .username(username)
                .fullName(fullName)
                .email(username + "@" + college.getDomain())
                .passwordHash(passwordEncoder.encode("1234"))
                .isActive(true)
                .mustChangePassword(false)
                .roles(Set.of(role))
                .build());
    }

    private void seedDemoStudent(College college) {
        String rollNumber = "2511cs020633";
        if (studentRepository.findByRollNumberAndCollegeId(rollNumber, college.getId()).isPresent()) {
            return;
        }

        Role studentRole = roleRepository.findByNameAndCollegeIsNull("Student").orElseThrow();
        User studentUser = User.builder()
                .college(college)
                .username(rollNumber)
                .fullName("Veeram Reddy")
                .email(rollNumber + "@" + college.getDomain())
                .passwordHash(passwordEncoder.encode("123456"))
                .isActive(true)
                .mustChangePassword(false)
                .roles(Set.of(studentRole))
                .build();
        userRepository.save(studentUser);

        studentRepository.save(Student.builder()
                .user(studentUser)
                .college(college)
                .rollNumber(rollNumber)
                .department("Computer Science")
                .year("2")
                .hostelBlock("A")
                .roomNumber("201")
                .build());
    }
}
