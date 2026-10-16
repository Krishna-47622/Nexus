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
        boolean hasAllIstharaFields = !existing.isEmpty() && existing.stream().allMatch(i -> i.getIstharaItemId() != null && i.getSellingPrice() != null);
        if (hasAllIstharaFields && existing.size() >= 30) {
            return; // Up to date with authentic Isthara items and prices
        }

        // Clean out legacy / non-Isthara items
        if (!existing.isEmpty()) {
            menuItemRepository.deleteAll(existing);
        }
        List<CanteenCategory> oldCats = categoryRepository.findByCollegeIdOrderByDisplayOrderAsc(mru.getId());
        if (!oldCats.isEmpty()) {
            categoryRepository.deleteAll(oldCats);
        }

        // --- MR FOOD COURT - 1 (Malla Reddy University) Live Menu with Exact Isthara Pricing & IDs ---
        CanteenCategory cat1 = categoryRepository.save(CanteenCategory.builder().college(mru).name("Burgers & Wraps").displayOrder(1).build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat1).name("Crunchy Chicken Burger").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("89.00")).sellingPrice(new BigDecimal("89.00")).basePrice(new BigDecimal("84.76")).taxValue(new BigDecimal("4.24")).taxPercent(new BigDecimal("5.00")).istharaItemId("dafd9553-ebb6-11f0-a87f-0215460ed287").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/287641c1767783107635Mlr-12-Shanghai%20Kitchen.png").vendorName("Burger Haven").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat1).name("Paneer Wrap").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("129.00")).sellingPrice(new BigDecimal("129.00")).basePrice(new BigDecimal("122.86")).taxValue(new BigDecimal("6.14")).taxPercent(new BigDecimal("5.00")).istharaItemId("0a4fe3e1-f03f-11f0-89e3-0215460ed287").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/706874c1768281403544Mlr-12-Shanghai%20Kitchen.png").vendorName("Burger Haven").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat1).name("Fried Chicken Wrap").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("139.00")).sellingPrice(new BigDecimal("139.00")).basePrice(new BigDecimal("132.38")).taxValue(new BigDecimal("6.62")).taxPercent(new BigDecimal("5.00")).istharaItemId("d6dc1d4a-f040-11f0-9208-024d9959caad").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/739500c1638180847383Fried%20Chicken%20Wrap.png").vendorName("Burger Haven").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat1).name("Egg Burger").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("49.00")).sellingPrice(new BigDecimal("49.00")).basePrice(new BigDecimal("46.67")).taxValue(new BigDecimal("2.33")).taxPercent(new BigDecimal("5.00")).istharaItemId("8034d773-03ed-11f1-836b-0215460ed287").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/310385c1770445408284Mlr-12-Shanghai%20Kitchen.png").vendorName("Burger Haven").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat1).name("2 Veg Burger").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("99.00")).sellingPrice(new BigDecimal("99.00")).basePrice(new BigDecimal("94.29")).taxValue(new BigDecimal("4.71")).taxPercent(new BigDecimal("5.00")).istharaItemId("24321026-03ee-11f1-836b-0215460ed287").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/103026c1638008890969Veg%20Burger.png").vendorName("Burger Haven").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat1).name("2 Non veg Burgers").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("129.00")).sellingPrice(new BigDecimal("129.00")).basePrice(new BigDecimal("122.86")).taxValue(new BigDecimal("6.14")).taxPercent(new BigDecimal("5.00")).istharaItemId("4244c744-03ee-11f1-813c-024d9959caad").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/239980c1638179099626Chicken%20Burger%20Cc.png").vendorName("Burger Haven").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat1).name("Chicken Schezwan Roll").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("50.00")).sellingPrice(new BigDecimal("50.00")).basePrice(new BigDecimal("50.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("439278b0-6977-11f1-b248-0215460ed287").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/211326c1781609633536bulk_1781609633217_3.jpg").vendorName("Brown Bear").build());

        CanteenCategory cat2 = categoryRepository.save(CanteenCategory.builder().college(mru).name("South Indian Breakfast").displayOrder(2).build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat2).name("Idly").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("40.01")).sellingPrice(new BigDecimal("40.01")).basePrice(new BigDecimal("38.10")).taxValue(new BigDecimal("1.91")).taxPercent(new BigDecimal("5.00")).istharaItemId("8313eb17-b44d-11ee-b5db-0022486ea389").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/312965c1638176428786idly.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat2).name("Plain Dosa").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("50.00")).sellingPrice(new BigDecimal("50.00")).basePrice(new BigDecimal("47.62")).taxValue(new BigDecimal("2.38")).taxPercent(new BigDecimal("5.00")).istharaItemId("e92c1015-b44d-11ee-81c0-6045bda5e089").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/728224c1637999591161Plain%20DosaPlain%20Dosa.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat2).name("Masala Dosa").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("50.00")).sellingPrice(new BigDecimal("50.00")).basePrice(new BigDecimal("47.62")).taxValue(new BigDecimal("2.38")).taxPercent(new BigDecimal("5.00")).istharaItemId("fce79cae-b44d-11ee-b5db-0022486ea389").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/549211c1637999700505Masala%20Dosa.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat2).name("Onion Dosa").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("50.00")).sellingPrice(new BigDecimal("50.00")).basePrice(new BigDecimal("47.62")).taxValue(new BigDecimal("2.38")).taxPercent(new BigDecimal("5.00")).istharaItemId("4a810db7-b44e-11ee-81c0-6045bda5e089").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/Ghee%20Onion%20Dosa%20(1).png?sp=racwl&st=2023-10-19T16:19:45Z&se=2030-12-05T00:19:45Z&sv=2022-11-02&sr=c&sig=Azu6X1u54tQLTVF1cRVWnhdzy9%2FFyr%2FklPGhaQCNHdY%3D").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat2).name("Vada").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("50.00")).sellingPrice(new BigDecimal("50.00")).basePrice(new BigDecimal("47.62")).taxValue(new BigDecimal("2.38")).taxPercent(new BigDecimal("5.00")).istharaItemId("5d4357ef-b44e-11ee-b5db-0022486ea389").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/901615c1637996879317Mask%20Group-18.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat2).name("Bonda").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("40.95")).sellingPrice(new BigDecimal("40.95")).basePrice(new BigDecimal("39.00")).taxValue(new BigDecimal("1.95")).taxPercent(new BigDecimal("5.00")).istharaItemId("9f872041-b44e-11ee-81c0-6045bda5e089").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/120621c1637912251716bonda.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat2).name("Upma Pesarattu").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("60.00")).sellingPrice(new BigDecimal("60.00")).basePrice(new BigDecimal("57.14")).taxValue(new BigDecimal("2.86")).taxPercent(new BigDecimal("5.00")).istharaItemId("fb8ec606-b44e-11ee-81c0-6045bda5e089").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/272456c1637997890227Upma.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat2).name("Egg Dosa").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("70.00")).sellingPrice(new BigDecimal("70.00")).basePrice(new BigDecimal("66.67")).taxValue(new BigDecimal("3.33")).taxPercent(new BigDecimal("5.00")).istharaItemId("c476c87b-8151-11f1-8896-06b0c8cd4fdd").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/525237c1784232359449Mlr-12-Shanghai%20Kitchen.png").vendorName("DL Kitchen").build());

        CanteenCategory cat3 = categoryRepository.save(CanteenCategory.builder().college(mru).name("Biryani & Rice Bowls").displayOrder(3).build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat3).name("Dl'S Chicken Dum Biryani").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("150.00")).sellingPrice(new BigDecimal("150.00")).basePrice(new BigDecimal("142.86")).taxValue(new BigDecimal("7.14")).taxPercent(new BigDecimal("5.00")).istharaItemId("b919993f-b4a6-11ee-b5db-0022486ea389").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/Egg%20Biryani%20(1).png?sp=racwl&st=2023-10-19T16:19:45Z&se=2030-12-05T00:19:45Z&sv=2022-11-02&sr=c&sig=Azu6X1u54tQLTVF1cRVWnhdzy9%2FFyr%2FklPGhaQCNHdY%3D").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat3).name("Dl's Chicken Fry Biryani").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("160.00")).sellingPrice(new BigDecimal("160.00")).basePrice(new BigDecimal("152.38")).taxValue(new BigDecimal("7.62")).taxPercent(new BigDecimal("5.00")).istharaItemId("09c66dbe-b450-11ee-81c0-6045bda5e089").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/CHICKEN%20FRY%20PIECE%20BIRYANI%20(1).png?sp=racwl&st=2023-10-19T16:19:45Z&se=2030-12-05T00:19:45Z&sv=2022-11-02&sr=c&sig=Azu6X1u54tQLTVF1cRVWnhdzy9%2FFyr%2FklPGhaQCNHdY%3D").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat3).name("Mutton Dum Biryani").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("250.01")).sellingPrice(new BigDecimal("250.01")).basePrice(new BigDecimal("238.10")).taxValue(new BigDecimal("11.91")).taxPercent(new BigDecimal("5.00")).istharaItemId("1cad51d3-b450-11ee-81c0-6045bda5e089").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/983618c1772002990155Mlr-12-Shanghai%20Kitchen%20%281%29.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat3).name("Chicken Mandi Biryani").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("190.10")).sellingPrice(new BigDecimal("190.10")).basePrice(new BigDecimal("181.05")).taxValue(new BigDecimal("9.05")).taxPercent(new BigDecimal("5.00")).istharaItemId("b4085f60-b44f-11ee-81c0-6045bda5e089").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(false).isAvailable(true).imageUrl("https://istharaprod.blob.core.windows.net/isthara-prod/master-food-items/461974c1638014119923Chicken%20Dum%20Biryani.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat3).name("Prawn Biryani").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("190.48")).sellingPrice(new BigDecimal("190.48")).basePrice(new BigDecimal("181.41")).taxValue(new BigDecimal("9.07")).taxPercent(new BigDecimal("5.00")).istharaItemId("9f91ad5e-b44f-11ee-81c0-6045bda5e089").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/157356c1757395376783Konaseema%20Prawn%20Biryani.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat3).name("South Indian -Veg-Meals").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("120.00")).sellingPrice(new BigDecimal("120.00")).basePrice(new BigDecimal("114.29")).taxValue(new BigDecimal("5.71")).taxPercent(new BigDecimal("5.00")).istharaItemId("48e8893e-b44f-11ee-81c0-6045bda5e089").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/Andhra%20Veg%20Meals%20(2).png?sp=racwl&st=2023-10-19T16:19:45Z&se=2030-12-05T00:19:45Z&sv=2022-11-02&sr=c&sig=Azu6X1u54tQLTVF1cRVWnhdzy9%2FFyr%2FklPGhaQCNHdY%3D").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat3).name("Veg Meals").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("99.00")).sellingPrice(new BigDecimal("99.00")).basePrice(new BigDecimal("94.29")).taxValue(new BigDecimal("4.71")).taxPercent(new BigDecimal("5.00")).istharaItemId("75cd3433-018d-11f1-ae7c-0215460ed287").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/507400c1770184257161Mlr-12-Shanghai%20Kitchen.png").vendorName("Burger Haven").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat3).name("Non Veg Meals").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("109.00")).sellingPrice(new BigDecimal("109.00")).basePrice(new BigDecimal("103.81")).taxValue(new BigDecimal("5.19")).taxPercent(new BigDecimal("5.00")).istharaItemId("9caad434-018d-11f1-ae7c-0215460ed287").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/744543c1770184321941Mlr-12-Shanghai%20Kitchen.png").vendorName("Burger Haven").build());

        CanteenCategory cat4 = categoryRepository.save(CanteenCategory.builder().college(mru).name("Chinese & Starters").displayOrder(4).build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat4).name("Veg Manchurian").description("SHIVAN FOODS • Authentic MR Food Court - 1 live item").price(new BigDecimal("105.00")).sellingPrice(new BigDecimal("105.00")).basePrice(new BigDecimal("100.00")).taxValue(new BigDecimal("5.00")).taxPercent(new BigDecimal("5.00")).istharaItemId("7d44bbd9-f502-11f0-bcac-024d9959caad").istharaVendorId("b286afff-f4fb-11f0-bcac-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/324111c1768805148382Veg%20Manchurian%20Dry.webp").vendorName("SHIVAN FOODS").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat4).name("CHILLY PANEER").description("SHIVAN FOODS • Authentic MR Food Court - 1 live item").price(new BigDecimal("136.50")).sellingPrice(new BigDecimal("136.50")).basePrice(new BigDecimal("130.00")).taxValue(new BigDecimal("6.50")).taxPercent(new BigDecimal("5.00")).istharaItemId("7437ebf0-f503-11f0-bae9-0215460ed287").istharaVendorId("b286afff-f4fb-11f0-bcac-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/541790c1768805562693Chilly%20Paneer%20.webp").vendorName("SHIVAN FOODS").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat4).name("Chicken 65").description("SHIVAN FOODS • Authentic MR Food Court - 1 live item").price(new BigDecimal("136.50")).sellingPrice(new BigDecimal("136.50")).basePrice(new BigDecimal("130.00")).taxValue(new BigDecimal("6.50")).taxPercent(new BigDecimal("5.00")).istharaItemId("561856c8-f506-11f0-bae9-0215460ed287").istharaVendorId("b286afff-f4fb-11f0-bcac-024d9959caad").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/171224c1638000546225Chicken%2065.png").vendorName("SHIVAN FOODS").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat4).name("Chicken Manchurian").description("SHIVAN FOODS • Authentic MR Food Court - 1 live item").price(new BigDecimal("126.00")).sellingPrice(new BigDecimal("126.00")).basePrice(new BigDecimal("120.00")).taxValue(new BigDecimal("6.00")).taxPercent(new BigDecimal("5.00")).istharaItemId("7d692535-f506-11f0-bcac-024d9959caad").istharaVendorId("b286afff-f4fb-11f0-bcac-024d9959caad").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/358086c1637929822470CM%20DRY.png").vendorName("SHIVAN FOODS").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat4).name("Chicken Nuggets (6pc)").description("SHIVAN FOODS • Authentic MR Food Court - 1 live item").price(new BigDecimal("105.00")).sellingPrice(new BigDecimal("105.00")).basePrice(new BigDecimal("100.00")).taxValue(new BigDecimal("5.00")).taxPercent(new BigDecimal("5.00")).istharaItemId("308a65d8-f507-11f0-bae9-0215460ed287").istharaVendorId("b286afff-f4fb-11f0-bcac-024d9959caad").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/841073c1768807166882Chicken%20Nuggets%20%286pc.%29.avif").vendorName("SHIVAN FOODS").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat4).name("Panner Fried Rice").description("SHIVAN FOODS • Authentic MR Food Court - 1 live item").price(new BigDecimal("136.50")).sellingPrice(new BigDecimal("136.50")).basePrice(new BigDecimal("130.00")).taxValue(new BigDecimal("6.50")).taxPercent(new BigDecimal("5.00")).istharaItemId("6922a686-f4ff-11f0-bcac-024d9959caad").istharaVendorId("b286afff-f4fb-11f0-bcac-024d9959caad").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/405537c1768803825824Paneer%20fried%20rice.jpg").vendorName("SHIVAN FOODS").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat4).name("Panner Kheema + Chapathi").description("SHIVAN FOODS • Authentic MR Food Court - 1 live item").price(new BigDecimal("105.00")).sellingPrice(new BigDecimal("105.00")).basePrice(new BigDecimal("100.00")).taxValue(new BigDecimal("5.00")).taxPercent(new BigDecimal("5.00")).istharaItemId("c4c54762-f504-11f0-bae9-0215460ed287").istharaVendorId("b286afff-f4fb-11f0-bcac-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/855902c1768806127142ChatGPT%20Image%20Jan%2019%2C%202026%2C%2012_31_53%20PM.png").vendorName("SHIVAN FOODS").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat4).name("Chicken Fried Rice").description("SHIVAN FOODS • Authentic MR Food Court - 1 live item").price(new BigDecimal("126.00")).sellingPrice(new BigDecimal("126.00")).basePrice(new BigDecimal("120.00")).taxValue(new BigDecimal("6.00")).taxPercent(new BigDecimal("5.00")).istharaItemId("7d25481e-7ea8-11f1-b9b4-069a4ca7c4ab").istharaVendorId("b286afff-f4fb-11f0-bcac-024d9959caad").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/255629c1783939753911Mlr-12-Shanghai%20Kitchen%20%282%29.png").vendorName("SHIVAN FOODS").build());

        CanteenCategory cat5 = categoryRepository.save(CanteenCategory.builder().college(mru).name("Bakery, Puffs & Pizzas").displayOrder(5).build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat5).name("Veg Puff").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("25.00")).sellingPrice(new BigDecimal("25.00")).basePrice(new BigDecimal("25.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("43b47fdb-6977-11f1-b248-0215460ed287").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/787995c1781609633575bulk_1781609633251_7.jpg").vendorName("Brown Bear").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat5).name("Egg Puff").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("30.00")).sellingPrice(new BigDecimal("30.00")).basePrice(new BigDecimal("30.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("43c596f9-6977-11f1-b248-0215460ed287").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/839473c1781609633598bulk_1781609633259_9.jpg").vendorName("Brown Bear").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat5).name("Paneer Puff").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("35.00")).sellingPrice(new BigDecimal("35.00")).basePrice(new BigDecimal("35.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("43bce45a-6977-11f1-b248-0215460ed287").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/618707c1781609633585bulk_1781609633255_8.jpg").vendorName("Brown Bear").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat5).name("Chicken Puff").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("35.00")).sellingPrice(new BigDecimal("35.00")).basePrice(new BigDecimal("35.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("43cd5f38-6977-11f1-b248-0215460ed287").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/770354c1781609633608bulk_1781609633262_10.jpg").vendorName("Brown Bear").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat5).name("Vegetable Baby Pizza").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("55.00")).sellingPrice(new BigDecimal("55.00")).basePrice(new BigDecimal("55.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("43770146-6977-11f1-b248-0215460ed287").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/571482c1781609633479bulk_1781609633139_0.jpg").vendorName("Brown Bear").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat5).name("Chicken Baby Pizza").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("70.00")).sellingPrice(new BigDecimal("70.00")).basePrice(new BigDecimal("70.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("43813a84-6977-11f1-b248-0215460ed287").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(false).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/599891c1781609633518bulk_1781609633208_1.jpg").vendorName("Brown Bear").build());

        CanteenCategory cat6 = categoryRepository.save(CanteenCategory.builder().college(mru).name("Beverages & Shakes").displayOrder(6).build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat6).name("Coke 250Ml Pet").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("20.00")).sellingPrice(new BigDecimal("20.00")).basePrice(new BigDecimal("20.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("77d8d0ab-aa90-11ef-8575-024d9959caad").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/430806c1755112925059Coke%20%28250Ml%29%20Pet%20%281%29.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat6).name("Badam Milk").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("50.00")).sellingPrice(new BigDecimal("50.00")).basePrice(new BigDecimal("47.62")).taxValue(new BigDecimal("2.38")).taxPercent(new BigDecimal("5.00")).istharaItemId("eaeaaf9c-ac23-11ef-9f77-0215460ed287").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/964150c1784234124026Mlr-12-Shanghai%20Kitchen.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat6).name("THUMS UP").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("25.00")).sellingPrice(new BigDecimal("25.00")).basePrice(new BigDecimal("25.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("9291b15c-64ae-11f1-9eee-024d9959caad").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/352276c1641286520445Breakfast%205.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat6).name("Iced Tea").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("50.00")).sellingPrice(new BigDecimal("50.00")).basePrice(new BigDecimal("50.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("8f724b3e-697e-11f1-a82d-024d9959caad").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/575760c1781612767563bulk_1781612767205_15.jpg").vendorName("Brown Bear").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat6).name("Peach Tea").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("50.00")).sellingPrice(new BigDecimal("50.00")).basePrice(new BigDecimal("50.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("8f7dbcfe-697e-11f1-a82d-024d9959caad").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/314151c1781612767578bulk_1781612767213_16.jpg").vendorName("Brown Bear").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat6).name("Chocolate Milkshake").description("Brown Bear • Authentic MR Food Court - 1 live item").price(new BigDecimal("100.00")).sellingPrice(new BigDecimal("100.00")).basePrice(new BigDecimal("100.00")).taxValue(new BigDecimal("0.00")).taxPercent(new BigDecimal("0.00")).istharaItemId("8f9b095d-697e-11f1-a82d-024d9959caad").istharaVendorId("a145fb10-6920-11f0-821c-0215460ed287").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/611745c1781612767609bulk_1781612767226_19.jpg").vendorName("Brown Bear").build());

        CanteenCategory cat7 = categoryRepository.save(CanteenCategory.builder().college(mru).name("Desserts & Ice Creams").displayOrder(7).build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat7).name("Vanilla Ice Cream").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("29.00")).sellingPrice(new BigDecimal("29.00")).basePrice(new BigDecimal("27.62")).taxValue(new BigDecimal("1.38")).taxPercent(new BigDecimal("5.00")).istharaItemId("3ae7c0c4-f2b2-11f0-bae9-0215460ed287").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/858632c1768550780139Mlr-12-Shanghai%20Kitchen.png").vendorName("Burger Haven").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat7).name("Ice Cream Mix").description("Burger Haven • Authentic MR Food Court - 1 live item").price(new BigDecimal("35.00")).sellingPrice(new BigDecimal("35.00")).basePrice(new BigDecimal("33.33")).taxValue(new BigDecimal("1.67")).taxPercent(new BigDecimal("5.00")).istharaItemId("1520b59c-00c2-11f1-ae7c-0215460ed287").istharaVendorId("3650ba30-e9fa-11f0-bc03-024d9959caad").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/894070c1638077308644Chocolate%20Ice%20Cream.png").vendorName("Burger Haven").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat7).name("Double Ka Meetha").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("60.00")).sellingPrice(new BigDecimal("60.00")).basePrice(new BigDecimal("57.14")).taxValue(new BigDecimal("2.86")).taxPercent(new BigDecimal("5.00")).istharaItemId("c85892ef-8155-11f1-8896-06b0c8cd4fdd").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/224377c1784234083929Mlr-12-Shanghai%20Kitchen.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat7).name("Gulab Jamun").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("50.00")).sellingPrice(new BigDecimal("50.00")).basePrice(new BigDecimal("47.62")).taxValue(new BigDecimal("2.38")).taxPercent(new BigDecimal("5.00")).istharaItemId("f7ee5f37-8155-11f1-8896-06b0c8cd4fdd").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/master-food-items/809790c1646227839835Gulab%20Jamoon%20%282Nos%29.png").vendorName("DL Kitchen").build());
        menuItemRepository.save(MenuItem.builder().college(mru).category(cat7).name("Kaddu Ki Kheer").description("DL Kitchen • Authentic MR Food Court - 1 live item").price(new BigDecimal("60.00")).sellingPrice(new BigDecimal("60.00")).basePrice(new BigDecimal("57.14")).taxValue(new BigDecimal("2.86")).taxPercent(new BigDecimal("5.00")).istharaItemId("12bde2c7-8156-11f1-915a-069a4ca7c4ab").istharaVendorId("32041477-7317-11ee-9add-6045bda5e089").isVeg(true).isAvailable(true).imageUrl("https://isthara-prod-mig.s3.ap-south-1.amazonaws.com/isthara-prod/food-court/529679c1784234208767Mlr-12-Shanghai%20Kitchen.png").vendorName("DL Kitchen").build());

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
