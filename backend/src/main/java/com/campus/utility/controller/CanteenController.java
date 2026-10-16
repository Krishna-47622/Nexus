package com.campus.utility.controller;

import com.campus.utility.dto.CanteenDTOs;
import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import com.campus.utility.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@Transactional
@RequestMapping("/api/v1/canteen")
public class CanteenController {

    private final CanteenCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;

    public CanteenController(CanteenCategoryRepository categoryRepository,
                             MenuItemRepository menuItemRepository,
                             OrderRepository orderRepository,
                             StudentRepository studentRepository,
                             UserRepository userRepository,
                             CollegeRepository collegeRepository,
                             TransactionRepository transactionRepository,
                             NotificationRepository notificationRepository) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.orderRepository = orderRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CanteenDTOs.CategoryDTO>> getCategories() {
        Long collegeId = TenantContext.getCollegeId();
        List<CanteenCategory> categories = categoryRepository.findByCollegeIdOrderByDisplayOrderAsc(collegeId);
        List<CanteenDTOs.CategoryDTO> dtos = categories.stream()
                .map(c -> new CanteenDTOs.CategoryDTO(c.getId(), c.getName(), c.getDisplayOrder()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/menu")
    public ResponseEntity<List<CanteenDTOs.MenuItemDTO>> getMenu() {
        Long collegeId = TenantContext.getCollegeId();
        List<MenuItem> items = menuItemRepository.findByCollegeIdAndIsAvailableTrue(collegeId);
        List<CanteenDTOs.MenuItemDTO> dtos = items.stream().map(this::mapToMenuItemDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody CanteenDTOs.OrderRequest request) {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student record missing"));
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new RuntimeException("College not found"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cart cannot be empty"));
        }

        BigDecimal total = BigDecimal.ZERO;

        String orderNum = "ORD-" + System.currentTimeMillis();
        String txnRef = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        boolean isUpiPlatform = "PLATFORM_UPI".equalsIgnoreCase(request.getPaymentMethod()) || "UPI".equalsIgnoreCase(request.getPaymentMethod());
        String initialPaymentStatus = isUpiPlatform ? "PENDING" : "PAID";
        String initialOrderStatus = isUpiPlatform ? "PAYMENT_PENDING" : "PLACED";

        Order order = Order.builder()
                .college(college)
                .student(student)
                .orderNumber(orderNum)
                .status(initialOrderStatus)
                .totalAmount(BigDecimal.ZERO)
                .paymentStatus(initialPaymentStatus)
                .upiTxnRef(txnRef)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();

        for (CanteenDTOs.OrderItemRequest reqItem : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(reqItem.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + reqItem.getMenuItemId()));

            BigDecimal itemTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(reqItem.getQuantity()));
            total = total.add(itemTotal);

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .itemName(menuItem.getName())
                    .quantity(reqItem.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .build());
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);

        orderRepository.save(order);

        transactionRepository.save(Transaction.builder()
                .college(college)
                .student(student)
                .type("CANTEEN")
                .amount(total)
                .status(initialPaymentStatus)
                .upiTxnRef(txnRef)
                .referenceId(String.valueOf(order.getId()))
                .build());

        if (!isUpiPlatform) {
            notificationRepository.save(Notification.builder()
                    .college(college)
                    .student(student)
                    .module("CANTEEN")
                    .title("Order Placed Successfully")
                    .message("Your order #" + orderNum + " of ₹" + total + " has been placed.")
                    .build());
        }

        String merchantUpi = "9398979155-1@superyes";
        String upiIntent = String.format("upi://pay?pa=%s&pn=Nexus+Food+Court&am=%.2f&tn=Order-%s&tr=%s",
                merchantUpi, total, orderNum, txnRef);

        CanteenDTOs.OrderDTO dto = mapToOrderDTO(order, upiIntent);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/orders/my")
    public ResponseEntity<List<CanteenDTOs.OrderDTO>> getMyOrders() {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();

        List<Order> orders = orderRepository.findByCollegeIdAndStudentIdOrderByCreatedAtDesc(collegeId, student.getId());
        List<CanteenDTOs.OrderDTO> dtos = orders.stream().map(o -> mapToOrderDTO(o, null)).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/staff/orders")
    @PreAuthorize("hasAuthority('CANTEEN_UPDATE_ORDER_STATUS') or hasAuthority('CANTEEN_VIEW_MENU') or hasAuthority('CANTEEN_MANAGE_MENU') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<List<CanteenDTOs.OrderDTO>> getStaffOrdersQueue(
            @RequestParam(required = false) String franchise) {
        Long collegeId = TenantContext.getCollegeId();
        if (collegeId == null) {
            collegeId = collegeRepository.findAll().stream().findFirst().map(College::getId).orElse(1L);
        }
        List<Order> orders = orderRepository.findByCollegeIdAndStatusIn(collegeId, List.of("PLACED", "PREPARING", "READY"));

        List<CanteenDTOs.OrderDTO> dtos = new ArrayList<>();
        boolean filterFranchise = franchise != null && !franchise.trim().isEmpty() && !"ALL".equalsIgnoreCase(franchise.trim());
        String targetFranchise = filterFranchise ? franchise.trim().toLowerCase() : "";

        for (Order o : orders) {
            CanteenDTOs.OrderDTO dto = mapToOrderDTO(o, null);
            if (filterFranchise) {
                List<CanteenDTOs.OrderItemDTO> franchiseItems = dto.getItems().stream()
                        .filter(i -> i.getVendorName() != null && i.getVendorName().trim().equalsIgnoreCase(targetFranchise))
                        .collect(Collectors.toList());

                if (!franchiseItems.isEmpty()) {
                    dto.setItems(franchiseItems);
                    BigDecimal franchiseTotal = franchiseItems.stream()
                            .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    dto.setTotalAmount(franchiseTotal);
                    dtos.add(dto);
                }
            } else {
                dtos.add(dto);
            }
        }

        return ResponseEntity.ok(dtos);
    }

    // ─── Staff: Menu & Item Management ────────────────────────────────
    @GetMapping("/staff/menu")
    @PreAuthorize("hasAuthority('CANTEEN_MANAGE_MENU') or hasAuthority('CANTEEN_VIEW_MENU') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<List<CanteenDTOs.MenuItemDTO>> getStaffMenu(
            @RequestParam(required = false) String franchise) {
        Long collegeId = TenantContext.getCollegeId();
        if (collegeId == null) {
            collegeId = collegeRepository.findAll().stream().findFirst().map(College::getId).orElse(1L);
        }
        List<MenuItem> items = menuItemRepository.findByCollegeId(collegeId);
        if (franchise != null && !franchise.trim().isEmpty() && !"ALL".equalsIgnoreCase(franchise.trim())) {
            String f = franchise.trim().toLowerCase();
            items = items.stream()
                    .filter(i -> i.getVendorName() != null && i.getVendorName().trim().equalsIgnoreCase(f))
                    .collect(Collectors.toList());
        }
        List<CanteenDTOs.MenuItemDTO> dtos = items.stream().map(this::mapToMenuItemDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/staff/menu")
    @PreAuthorize("hasAuthority('CANTEEN_MANAGE_MENU') or hasAuthority('ROLE_CANTEEN_STAFF') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<?> addMenuItem(@RequestBody CanteenDTOs.MenuItemDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Menu item name is required"));
        }
        if (dto.getPrice() == null || dto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Valid price is required"));
        }

        Long collegeId = TenantContext.getCollegeId();
        if (collegeId == null) {
            collegeId = collegeRepository.findAll().stream().findFirst().map(College::getId).orElse(1L);
        }
        final Long effectiveCollegeId = collegeId;
        College college = collegeRepository.findById(effectiveCollegeId)
                .orElseGet(() -> collegeRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("College not found")));

        CanteenCategory category;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseGet(() -> categoryRepository.save(CanteenCategory.builder().college(college).name(dto.getCategoryName() != null ? dto.getCategoryName() : "Main Menu").displayOrder(1).build()));
        } else if (dto.getCategoryName() != null && !dto.getCategoryName().trim().isEmpty()) {
            category = categoryRepository.findByCollegeIdAndName(effectiveCollegeId, dto.getCategoryName().trim())
                    .orElseGet(() -> categoryRepository.save(CanteenCategory.builder().college(college).name(dto.getCategoryName().trim()).displayOrder(1).build()));
        } else {
            category = categoryRepository.findByCollegeIdOrderByDisplayOrderAsc(effectiveCollegeId).stream().findFirst()
                    .orElseGet(() -> categoryRepository.save(CanteenCategory.builder().college(college).name("Main Menu").displayOrder(1).build()));
        }

        MenuItem item = MenuItem.builder()
                .college(college)
                .category(category)
                .name(dto.getName().trim())
                .description(dto.getDescription() != null ? dto.getDescription().trim() : "")
                .price(dto.getPrice())
                .sellingPrice(dto.getSellingPrice() != null ? dto.getSellingPrice() : dto.getPrice())
                .basePrice(dto.getBasePrice() != null ? dto.getBasePrice() : dto.getPrice())
                .taxValue(dto.getTaxValue() != null ? dto.getTaxValue() : BigDecimal.ZERO)
                .taxPercent(dto.getTaxPercent() != null ? dto.getTaxPercent() : BigDecimal.ZERO)
                .isVeg(Boolean.TRUE.equals(dto.getIsVeg()))
                .isAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true)
                .imageUrl(dto.getImageUrl())
                .vendorName(dto.getVendorName() != null && !dto.getVendorName().trim().isEmpty() ? dto.getVendorName().trim() : "MR Food Court")
                .build();

        menuItemRepository.save(item);
        return ResponseEntity.ok(Map.of("message", "Menu item added successfully", "item", mapToMenuItemDTO(item)));
    }

    @PutMapping("/staff/menu/{id}")
    @PreAuthorize("hasAuthority('CANTEEN_MANAGE_MENU') or hasAuthority('ROLE_CANTEEN_STAFF') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long id, @RequestBody CanteenDTOs.MenuItemDTO dto) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            item.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            item.setDescription(dto.getDescription().trim());
        }
        if (dto.getPrice() != null && dto.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            item.setPrice(dto.getPrice());
            item.setSellingPrice(dto.getSellingPrice() != null ? dto.getSellingPrice() : dto.getPrice());
        }
        if (dto.getIsVeg() != null) {
            item.setIsVeg(dto.getIsVeg());
        }
        if (dto.getIsAvailable() != null) {
            item.setIsAvailable(dto.getIsAvailable());
        }
        if (dto.getImageUrl() != null) {
            item.setImageUrl(dto.getImageUrl());
        }
        if (dto.getVendorName() != null && !dto.getVendorName().trim().isEmpty()) {
            item.setVendorName(dto.getVendorName().trim());
        }
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId()).ifPresent(item::setCategory);
        }

        menuItemRepository.save(item);
        return ResponseEntity.ok(Map.of("message", "Menu item updated successfully", "item", mapToMenuItemDTO(item)));
    }

    @PatchMapping("/staff/menu/{id}/availability")
    @PreAuthorize("hasAuthority('CANTEEN_MANAGE_MENU') or hasAuthority('ROLE_CANTEEN_STAFF') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<?> toggleItemAvailability(@PathVariable Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        boolean newStatus = !Boolean.TRUE.equals(item.getIsAvailable());
        item.setIsAvailable(newStatus);
        menuItemRepository.save(item);

        return ResponseEntity.ok(Map.of(
                "message", "Item marked as " + (newStatus ? "In Stock" : "Out of Stock"),
                "isAvailable", newStatus,
                "item", mapToMenuItemDTO(item)
        ));
    }

    @DeleteMapping("/staff/menu/{id}")
    @PreAuthorize("hasAuthority('CANTEEN_MANAGE_MENU') or hasAuthority('ROLE_CANTEEN_STAFF') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        item.setIsAvailable(false);
        menuItemRepository.save(item);
        return ResponseEntity.ok(Map.of("message", "Menu item deactivated successfully"));
    }

    @PatchMapping("/staff/orders/{orderId}/status")
    @PreAuthorize("hasAuthority('CANTEEN_UPDATE_ORDER_STATUS') or hasAuthority('CANTEEN_MANAGE_MENU') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(orderId).orElseThrow();

        String newStatus = body.get("status");
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        notificationRepository.save(Notification.builder()
                .college(order.getCollege())
                .student(order.getStudent())
                .module("CANTEEN")
                .title("Order Status Update")
                .message("Your canteen order #" + order.getOrderNumber() + " is now " + newStatus.replace("_", " ") + ".")
                .build());

        return ResponseEntity.ok(mapToOrderDTO(order, null));
    }

    @PostMapping("/orders/{orderId}/verify-payment")
    public ResponseEntity<?> verifyPlatformPayment(@PathVariable Long orderId, @RequestBody(required = false) Map<String, String> body) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentStatus("PAID");
        order.setStatus("PLACED");
        order.setUpdatedAt(LocalDateTime.now());

        String utr = (body != null && body.containsKey("utr")) ? body.get("utr") : "UTR-" + System.currentTimeMillis();
        order.setUpiTxnRef(utr);
        orderRepository.save(order);

        Optional<Transaction> existingTxn = transactionRepository.findByCollegeIdAndReferenceId(order.getCollege().getId(), String.valueOf(order.getId()));
        if (existingTxn.isPresent()) {
            Transaction txn = existingTxn.get();
            txn.setStatus("PAID");
            txn.setUpiTxnRef(utr);
            transactionRepository.save(txn);
        }

        notificationRepository.save(Notification.builder()
                .college(order.getCollege())
                .student(order.getStudent())
                .module("CANTEEN")
                .title("Platform Payment Confirmed")
                .message("Payment of ₹" + order.getTotalAmount() + " confirmed for Order #" + order.getOrderNumber() + " via Platform UPI (" + utr + ").")
                .build());

        Map<String, Object> response = new HashMap<>();
        response.put("order", mapToOrderDTO(order, null));
        response.put("status", "SUCCESS");
        response.put("message", "Platform payment verified successfully");
        response.put("transactionId", utr);
        response.put("tokenNumber", "MR-" + (100 + (order.getId() % 900)));
        response.put("estimatedPrepMinutes", 12);
        response.put("pickupLocation", "MR Food Court - 1 (Counter #3, Malla Reddy University)");

        return ResponseEntity.ok(response);
    }


    private CanteenDTOs.MenuItemDTO mapToMenuItemDTO(MenuItem item) {
        return CanteenDTOs.MenuItemDTO.builder()
                .id(item.getId())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : "General")
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .sellingPrice(item.getSellingPrice() != null ? item.getSellingPrice() : item.getPrice())
                .basePrice(item.getBasePrice() != null ? item.getBasePrice() : item.getPrice())
                .taxValue(item.getTaxValue() != null ? item.getTaxValue() : BigDecimal.ZERO)
                .taxPercent(item.getTaxPercent() != null ? item.getTaxPercent() : BigDecimal.ZERO)
                .istharaItemId(item.getIstharaItemId())
                .istharaVendorId(item.getIstharaVendorId())
                .isVeg(item.getIsVeg())
                .isAvailable(item.getIsAvailable())
                .imageUrl(item.getImageUrl())
                .vendorName(item.getVendorName())
                .build();
    }

    private CanteenDTOs.OrderDTO mapToOrderDTO(Order o, String upiIntent) {
        List<CanteenDTOs.OrderItemDTO> items = o.getItems().stream()
                .map(i -> CanteenDTOs.OrderItemDTO.builder()
                        .id(i.getId())
                        .menuItemId(i.getMenuItem() != null ? i.getMenuItem().getId() : null)
                        .itemName(i.getItemName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .vendorName(i.getMenuItem() != null && i.getMenuItem().getVendorName() != null ? i.getMenuItem().getVendorName() : "MR Food Court")
                        .build())
                .collect(Collectors.toList());

        List<String> vendors = items.stream()
                .map(CanteenDTOs.OrderItemDTO::getVendorName)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        return CanteenDTOs.OrderDTO.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .studentName(o.getStudent().getUser().getFullName())
                .rollNumber(o.getStudent().getRollNumber())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .paymentStatus(o.getPaymentStatus())
                .upiTxnRef(o.getUpiTxnRef())
                .upiIntentUrl(upiIntent)
                .items(items)
                .vendors(vendors)
                .createdAt(o.getCreatedAt())
                .build();
    }
}
