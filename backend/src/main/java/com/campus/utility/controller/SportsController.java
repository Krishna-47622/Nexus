package com.campus.utility.controller;

import com.campus.utility.dto.SportsDTOs;
import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import com.campus.utility.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sports")
public class SportsController {

    private final EquipmentRepository equipmentRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;

    public SportsController(EquipmentRepository equipmentRepository,
                            BorrowRequestRepository borrowRequestRepository,
                            StudentRepository studentRepository,
                            UserRepository userRepository,
                            CollegeRepository collegeRepository,
                            TransactionRepository transactionRepository,
                            NotificationRepository notificationRepository) {
        this.equipmentRepository = equipmentRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/equipment")
    public ResponseEntity<List<SportsDTOs.EquipmentDTO>> getEquipment() {
        Long collegeId = TenantContext.getCollegeId();
        List<Equipment> items = equipmentRepository.findByCollegeIdAndIsActiveTrue(collegeId);
        List<SportsDTOs.EquipmentDTO> dtos = items.stream().map(this::mapToEquipmentDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/borrow-request")
    public ResponseEntity<?> createBorrowRequest(@RequestBody SportsDTOs.BorrowRequestInput input) {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();
        College college = collegeRepository.findById(collegeId).orElseThrow();

        Equipment equipment = equipmentRepository.findById(input.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (equipment.getAvailableQty() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Item is currently out of stock / unavailable"));
        }

        BorrowRequest request = BorrowRequest.builder()
                .college(college)
                .student(student)
                .equipment(equipment)
                .expectedReturnAt(input.getExpectedReturnAt())
                .status("PENDING")
                .fineAmount(BigDecimal.ZERO)
                .finePaid(false)
                .build();

        borrowRequestRepository.save(request);

        notificationRepository.save(Notification.builder()
                .college(college)
                .student(student)
                .module("SPORTS")
                .title("Borrow Request Submitted")
                .message("Your borrow request for " + equipment.getName() + " is pending staff approval.")
                .build());

        return ResponseEntity.ok(mapToBorrowDTO(request));
    }

    @GetMapping("/my-borrows")
    public ResponseEntity<List<SportsDTOs.BorrowRequestDTO>> getMyBorrows() {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();

        List<BorrowRequest> list = borrowRequestRepository.findByCollegeIdAndStudentIdOrderByCreatedAtDesc(collegeId, student.getId());

        LocalDateTime now = LocalDateTime.now();
        for (BorrowRequest req : list) {
            if ("APPROVED".equals(req.getStatus()) && now.isAfter(req.getExpectedReturnAt())) {
                long daysOverdue = Math.max(1, Duration.between(req.getExpectedReturnAt(), now).toDays());
                BigDecimal fine = req.getEquipment().getLateFineRatePerDay().multiply(BigDecimal.valueOf(daysOverdue));
                req.setStatus("OVERDUE");
                req.setFineAmount(fine);
                borrowRequestRepository.save(req);
            }
        }

        List<SportsDTOs.BorrowRequestDTO> dtos = list.stream().map(this::mapToBorrowDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/staff/pending")
    @PreAuthorize("hasAuthority('SPORTS_APPROVE_BORROW')")
    public ResponseEntity<List<SportsDTOs.BorrowRequestDTO>> getStaffPendingRequests() {
        Long collegeId = TenantContext.getCollegeId();
        List<BorrowRequest> list = borrowRequestRepository.findByCollegeIdAndStatus(collegeId, "PENDING");
        List<SportsDTOs.BorrowRequestDTO> dtos = list.stream().map(this::mapToBorrowDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/staff/requests/{id}/process")
    @PreAuthorize("hasAuthority('SPORTS_APPROVE_BORROW')")
    public ResponseEntity<?> processRequest(@PathVariable Long id, @RequestBody SportsDTOs.ProcessBorrowRequest process) {
        BorrowRequest request = borrowRequestRepository.findById(id).orElseThrow();

        if ("APPROVE".equalsIgnoreCase(process.getAction())) {
            Equipment eq = equipmentRepository.findWithLockById(request.getEquipment().getId())
                    .orElseThrow(() -> new RuntimeException("Equipment unavailable"));

            if (eq.getAvailableQty() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "No units left to approve"));
            }

            eq.setAvailableQty(eq.getAvailableQty() - 1);
            equipmentRepository.save(eq);

            request.setStatus("APPROVED");
            request.setApprovedAt(LocalDateTime.now());
            request.setRemarks(process.getRemarks());
            borrowRequestRepository.save(request);

            notificationRepository.save(Notification.builder()
                    .college(request.getCollege())
                    .student(request.getStudent())
                    .module("SPORTS")
                    .title("Borrow Request Approved")
                    .message("Your borrow request for " + eq.getName() + " has been approved! Collect it from the Sports Room.")
                    .build());
        } else {
            request.setStatus("REJECTED");
            request.setRemarks(process.getRemarks());
            borrowRequestRepository.save(request);

            notificationRepository.save(Notification.builder()
                    .college(request.getCollege())
                    .student(request.getStudent())
                    .module("SPORTS")
                    .title("Borrow Request Rejected")
                    .message("Your borrow request for " + request.getEquipment().getName() + " was rejected. Reason: " + process.getRemarks())
                    .build());
        }

        return ResponseEntity.ok(mapToBorrowDTO(request));
    }

    @GetMapping("/staff/current")
    @PreAuthorize("hasAuthority('SPORTS_MARK_RETURNED') or hasAuthority('SPORTS_APPROVE_BORROW')")
    public ResponseEntity<List<SportsDTOs.BorrowRequestDTO>> getCurrentlyOut() {
        Long collegeId = TenantContext.getCollegeId();
        List<BorrowRequest> list = borrowRequestRepository.findByCollegeIdAndStatusIn(collegeId, List.of("APPROVED", "OVERDUE"));
        List<SportsDTOs.BorrowRequestDTO> dtos = list.stream().map(this::mapToBorrowDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/staff/requests/{id}/return")
    @PreAuthorize("hasAuthority('SPORTS_MARK_RETURNED')")
    public ResponseEntity<?> markReturned(@PathVariable Long id) {
        BorrowRequest request = borrowRequestRepository.findById(id).orElseThrow();

        if ("RETURNED".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Item is already returned"));
        }

        Equipment eq = equipmentRepository.findWithLockById(request.getEquipment().getId()).orElseThrow();
        eq.setAvailableQty(eq.getAvailableQty() + 1);
        equipmentRepository.save(eq);

        LocalDateTime now = LocalDateTime.now();
        request.setStatus("RETURNED");
        request.setReturnedAt(now);

        if (now.isAfter(request.getExpectedReturnAt())) {
            long daysOverdue = Math.max(1, Duration.between(request.getExpectedReturnAt(), now).toDays());
            BigDecimal fine = eq.getLateFineRatePerDay().multiply(BigDecimal.valueOf(daysOverdue));
            request.setFineAmount(fine);
        }

        borrowRequestRepository.save(request);

        notificationRepository.save(Notification.builder()
                .college(request.getCollege())
                .student(request.getStudent())
                .module("SPORTS")
                .title("Equipment Returned")
                .message("Equipment " + eq.getName() + " has been marked returned." +
                        (request.getFineAmount().compareTo(BigDecimal.ZERO) > 0 ? " Pending fine: ₹" + request.getFineAmount() : ""))
                .build());

        return ResponseEntity.ok(mapToBorrowDTO(request));
    }

    @PostMapping("/my-borrows/{id}/pay-fine")
    public ResponseEntity<?> payFine(@PathVariable Long id) {
        BorrowRequest request = borrowRequestRepository.findById(id).orElseThrow();

        if (request.getFineAmount().compareTo(BigDecimal.ZERO) <= 0 || request.getFinePaid()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No fine pending for this item"));
        }

        String txnRef = "FINE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        request.setFinePaid(true);
        request.setUpiTxnRef(txnRef);
        borrowRequestRepository.save(request);

        transactionRepository.save(Transaction.builder()
                .college(request.getCollege())
                .student(request.getStudent())
                .type("FINE")
                .amount(request.getFineAmount())
                .status("PAID")
                .upiTxnRef(txnRef)
                .referenceId(String.valueOf(request.getId()))
                .build());

        return ResponseEntity.ok(mapToBorrowDTO(request));
    }

    private SportsDTOs.EquipmentDTO mapToEquipmentDTO(Equipment e) {
        return SportsDTOs.EquipmentDTO.builder()
                .id(e.getId())
                .name(e.getName())
                .category(e.getCategory())
                .totalQty(e.getTotalQty())
                .availableQty(e.getAvailableQty())
                .lateFineRatePerDay(e.getLateFineRatePerDay())
                .isActive(e.getIsActive())
                .build();
    }

    private SportsDTOs.BorrowRequestDTO mapToBorrowDTO(BorrowRequest r) {
        String upiIntent = null;
        if (r.getFineAmount().compareTo(BigDecimal.ZERO) > 0 && !r.getFinePaid()) {
            upiIntent = String.format("upi://pay?pa=sports@%s&pn=%s+Sports&am=%.2f&tn=FINE-%s&tr=FINE-%s",
                    r.getCollege().getDomain(), r.getCollege().getName().replaceAll(" ", ""), r.getFineAmount(), r.getId(), UUID.randomUUID().toString().substring(0, 6));
        }

        return SportsDTOs.BorrowRequestDTO.builder()
                .id(r.getId())
                .equipmentId(r.getEquipment().getId())
                .equipmentName(r.getEquipment().getName())
                .category(r.getEquipment().getCategory())
                .studentName(r.getStudent().getUser().getFullName())
                .rollNumber(r.getStudent().getRollNumber())
                .expectedReturnAt(r.getExpectedReturnAt())
                .status(r.getStatus())
                .approvedAt(r.getApprovedAt())
                .returnedAt(r.getReturnedAt())
                .fineAmount(r.getFineAmount())
                .finePaid(r.getFinePaid())
                .upiTxnRef(r.getUpiTxnRef())
                .upiIntentUrl(upiIntent)
                .remarks(r.getRemarks())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
