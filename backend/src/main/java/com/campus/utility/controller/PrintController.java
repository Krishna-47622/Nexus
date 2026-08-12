package com.campus.utility.controller;

import com.campus.utility.dto.PrintDTOs;
import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import com.campus.utility.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@Transactional
@RequestMapping("/api/v1/print")
public class PrintController {

    private final PrintPricingRepository printPricingRepository;
    private final PrintJobRepository printJobRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;

    public PrintController(PrintPricingRepository printPricingRepository,
                           PrintJobRepository printJobRepository,
                           StudentRepository studentRepository,
                           UserRepository userRepository,
                           CollegeRepository collegeRepository,
                           TransactionRepository transactionRepository,
                           NotificationRepository notificationRepository) {
        this.printPricingRepository = printPricingRepository;
        this.printJobRepository = printJobRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/pricing")
    public ResponseEntity<PrintDTOs.PrintPricingDTO> getPricing() {
        Long collegeId = TenantContext.getCollegeId();
        PrintPricing pricing = printPricingRepository.findByCollegeId(collegeId)
                .orElse(PrintPricing.builder().bwPerPage(new BigDecimal("2.00")).colorPerPage(new BigDecimal("10.00")).build());

        return ResponseEntity.ok(new PrintDTOs.PrintPricingDTO(pricing.getBwPerPage(), pricing.getColorPerPage()));
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> submitJob(@RequestBody PrintDTOs.PrintJobInput input) {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();
        College college = collegeRepository.findById(collegeId).orElseThrow();

        PrintPricing pricing = printPricingRepository.findByCollegeId(collegeId)
                .orElse(PrintPricing.builder().bwPerPage(new BigDecimal("2.00")).colorPerPage(new BigDecimal("10.00")).build());

        BigDecimal rate = Boolean.TRUE.equals(input.getIsColor()) ? pricing.getColorPerPage() : pricing.getBwPerPage();
        int totalPages = Math.max(1, input.getTotalPages() != null ? input.getTotalPages() : 1);
        int copies = Math.max(1, input.getCopies() != null ? input.getCopies() : 1);

        BigDecimal totalCost = rate.multiply(BigDecimal.valueOf(totalPages * copies));
        String txnRef = "PRINT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PrintJob job = PrintJob.builder()
                .college(college)
                .student(student)
                .fileUrl(input.getFileUrl())
                .fileName(input.getFileName())
                .copies(copies)
                .isColor(Boolean.TRUE.equals(input.getIsColor()))
                .isDoubleSided(Boolean.TRUE.equals(input.getIsDoubleSided()))
                .paperSize(input.getPaperSize() != null ? input.getPaperSize() : "A4")
                .totalPages(totalPages)
                .totalCost(totalCost)
                .status("QUEUED")
                .paymentStatus("PAID")
                .upiTxnRef(txnRef)
                .build();

        printJobRepository.save(job);

        transactionRepository.save(Transaction.builder()
                .college(college)
                .student(student)
                .type("PRINT")
                .amount(totalCost)
                .status("PAID")
                .upiTxnRef(txnRef)
                .referenceId(String.valueOf(job.getId()))
                .build());

        notificationRepository.save(Notification.builder()
                .college(college)
                .student(student)
                .module("PRINT")
                .title("Print Job Submitted")
                .message("Your document " + job.getFileName() + " (" + totalPages + " pages) is queued for printing.")
                .build());

        String upiIntent = String.format("upi://pay?pa=print@%s&pn=%s+PrintShop&am=%.2f&tn=PRINT-%s&tr=%s",
                college.getDomain(), college.getName().replaceAll(" ", ""), totalCost, job.getId(), txnRef);

        return ResponseEntity.ok(mapToJobDTO(job, upiIntent));
    }

    @GetMapping("/jobs/my")
    public ResponseEntity<List<PrintDTOs.PrintJobDTO>> getMyJobs() {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();

        List<PrintJob> jobs = printJobRepository.findByCollegeIdAndStudentIdOrderByCreatedAtDesc(collegeId, student.getId());
        List<PrintDTOs.PrintJobDTO> dtos = jobs.stream().map(j -> mapToJobDTO(j, null)).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/staff/queue")
    @PreAuthorize("hasAuthority('PRINT_VIEW_QUEUE')")
    public ResponseEntity<List<PrintDTOs.PrintJobDTO>> getStaffQueue() {
        Long collegeId = TenantContext.getCollegeId();
        List<PrintJob> jobs = printJobRepository.findByCollegeIdAndStatusInOrderByCreatedAtAsc(collegeId, List.of("QUEUED", "PRINTING", "READY"));
        List<PrintDTOs.PrintJobDTO> dtos = jobs.stream().map(j -> mapToJobDTO(j, null)).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/staff/jobs/{id}/status")
    @PreAuthorize("hasAuthority('PRINT_UPDATE_JOB_STATUS')")
    public ResponseEntity<?> updateJobStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        PrintJob job = printJobRepository.findById(id).orElseThrow();
        String newStatus = body.get("status");
        job.setStatus(newStatus);
        printJobRepository.save(job);

        notificationRepository.save(Notification.builder()
                .college(job.getCollege())
                .student(job.getStudent())
                .module("PRINT")
                .title("Print Job Status")
                .message("Your document " + job.getFileName() + " is now " + newStatus.replace("_", " ") + ".")
                .build());

        return ResponseEntity.ok(mapToJobDTO(job, null));
    }

    private PrintDTOs.PrintJobDTO mapToJobDTO(PrintJob j, String upiIntent) {
        return PrintDTOs.PrintJobDTO.builder()
                .id(j.getId())
                .studentName(j.getStudent().getUser().getFullName())
                .rollNumber(j.getStudent().getRollNumber())
                .fileUrl(j.getFileUrl())
                .fileName(j.getFileName())
                .copies(j.getCopies())
                .isColor(j.getIsColor())
                .isDoubleSided(j.getIsDoubleSided())
                .paperSize(j.getPaperSize())
                .totalPages(j.getTotalPages())
                .totalCost(j.getTotalCost())
                .status(j.getStatus())
                .paymentStatus(j.getPaymentStatus())
                .upiTxnRef(j.getUpiTxnRef())
                .upiIntentUrl(upiIntent)
                .createdAt(j.getCreatedAt())
                .build();
    }
}
