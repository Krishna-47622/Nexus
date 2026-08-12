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
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(PermissionRepository permissionRepository,
                      RoleRepository roleRepository,
                      UserRepository userRepository,
                      CollegeRepository collegeRepository,
                      CanteenCategoryRepository categoryRepository,
                      MenuItemRepository menuItemRepository,
                      EquipmentRepository equipmentRepository,
                      PrintPricingRepository printPricingRepository,
                      PasswordEncoder passwordEncoder) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.equipmentRepository = equipmentRepository;
        this.printPricingRepository = printPricingRepository;
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
        createRoleIfAbsent("Canteen Staff", getPerms(permMap, "CANTEEN_VIEW_MENU", "CANTEEN_UPDATE_ORDER_STATUS"));
        createRoleIfAbsent("Sports Room Staff", getPerms(permMap, "SPORTS_VIEW_EQUIPMENT", "SPORTS_APPROVE_BORROW", "SPORTS_MARK_RETURNED"));
        createRoleIfAbsent("Print Shop Staff", getPerms(permMap, "PRINT_VIEW_QUEUE", "PRINT_UPDATE_JOB_STATUS"));
        createRoleIfAbsent("Warden", getPerms(permMap, "LEAVE_OUTPASS_APPROVE_REJECT_REQUEST", "LEAVE_OUTPASS_VIEW_REQUESTS"));
        createRoleIfAbsent("Student", getPerms(permMap, "CANTEEN_VIEW_MENU", "CANTEEN_PLACE_ORDER", "SPORTS_VIEW_EQUIPMENT", "SPORTS_REQUEST_BORROW", "PRINT_SUBMIT_JOB", "LEAVE_OUTPASS_SUBMIT_REQUEST", "LEAVE_OUTPASS_VIEW_REQUESTS"));
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

            // Default Canteen Category & Items
            CanteenCategory snacks = categoryRepository.save(CanteenCategory.builder().college(mru).name("Hot Snacks & Breakfast").displayOrder(1).build());
            CanteenCategory drinks = categoryRepository.save(CanteenCategory.builder().college(mru).name("Beverages & Shakes").displayOrder(2).build());

            menuItemRepository.save(MenuItem.builder().college(mru).category(snacks).name("Masala Dosa").description("Crispy South Indian Dosa served with Coconut Chutney").price(new BigDecimal("60.00")).isVeg(true).isAvailable(true).imageUrl("https://images.unsplash.com/photo-1630383249898-4242b2f0b1ba?w=300").build());
            menuItemRepository.save(MenuItem.builder().college(mru).category(snacks).name("Veg Thali").description("Complete North Indian Lunch Thali with Paneer & Chapati").price(new BigDecimal("120.00")).isVeg(true).isAvailable(true).imageUrl("https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300").build());
            menuItemRepository.save(MenuItem.builder().college(mru).category(drinks).name("Cold Coffee with Ice Cream").description("Chilled Espresso blended with Chocolate & Vanilla").price(new BigDecimal("75.00")).isVeg(true).isAvailable(true).imageUrl("https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300").build());

            // Default Equipment
            equipmentRepository.save(Equipment.builder().college(mru).name("Badminton Racket Set").category("Badminton").totalQty(15).availableQty(15).lateFineRatePerDay(new BigDecimal("10.00")).isActive(true).build());
            equipmentRepository.save(Equipment.builder().college(mru).name("Tournament Football").category("Football").totalQty(10).availableQty(10).lateFineRatePerDay(new BigDecimal("15.00")).isActive(true).build());

            // Default Print Pricing
            printPricingRepository.save(PrintPricing.builder().college(mru).bwPerPage(new BigDecimal("2.00")).colorPerPage(new BigDecimal("10.00")).build());
        }
    }
}
