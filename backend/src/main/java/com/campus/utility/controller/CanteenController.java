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

        Order order = Order.builder()
                .college(college)
                .student(student)
                .orderNumber(orderNum)
                .status("PLACED")
                .totalAmount(BigDecimal.ZERO)
                .paymentStatus("PAID")
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
                .status("PAID")
                .upiTxnRef(txnRef)
                .referenceId(String.valueOf(order.getId()))
                .build());

        notificationRepository.save(Notification.builder()
                .college(college)
                .student(student)
                .module("CANTEEN")
                .title("Order Placed Successfully")
                .message("Your order #" + orderNum + " of ₹" + total + " has been placed.")
                .build());

        String upiIntent = String.format("upi://pay?pa=canteen@%s&pn=%s+Canteen&am=%.2f&tn=%s&tr=%s",
                college.getDomain(), college.getName().replaceAll(" ", ""), total, orderNum, txnRef);

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
    @PreAuthorize("hasAuthority('CANTEEN_UPDATE_ORDER_STATUS') or hasAuthority('CANTEEN_VIEW_MENU')")
    public ResponseEntity<List<CanteenDTOs.OrderDTO>> getStaffOrdersQueue() {
        Long collegeId = TenantContext.getCollegeId();
        List<Order> orders = orderRepository.findByCollegeIdAndStatusIn(collegeId, List.of("PLACED", "PREPARING", "READY"));
        List<CanteenDTOs.OrderDTO> dtos = orders.stream().map(o -> mapToOrderDTO(o, null)).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/staff/orders/{orderId}/status")
    @PreAuthorize("hasAuthority('CANTEEN_UPDATE_ORDER_STATUS')")
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

    private CanteenDTOs.MenuItemDTO mapToMenuItemDTO(MenuItem item) {
        return CanteenDTOs.MenuItemDTO.builder()
                .id(item.getId())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : "General")
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .isVeg(item.getIsVeg())
                .isAvailable(item.getIsAvailable())
                .imageUrl(item.getImageUrl())
                .build();
    }

    private CanteenDTOs.OrderDTO mapToOrderDTO(Order o, String upiIntent) {
        List<CanteenDTOs.OrderItemDTO> items = o.getItems().stream()
                .map(i -> new CanteenDTOs.OrderItemDTO(i.getId(), i.getMenuItem() != null ? i.getMenuItem().getId() : null, i.getItemName(), i.getQuantity(), i.getUnitPrice()))
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
                .createdAt(o.getCreatedAt())
                .build();
    }
}
