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
import java.math.RoundingMode;
import java.time.LocalDateTime;
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

    // ─── Get full pricing configuration ───────────────────────────────
    @GetMapping("/pricing")
    public ResponseEntity<PrintDTOs.PrintPricingDTO> getPricing() {
        Long collegeId = TenantContext.getCollegeId();
        PrintPricing pricing = getOrCreateDefaultPricing(collegeId);

        return ResponseEntity.ok(mapToPricingDTO(pricing));
    }

    // ─── Real-time price estimate (called as student configures options) ───
    @PostMapping("/estimate")
    public ResponseEntity<Map<String, Object>> estimatePrice(@RequestBody PrintDTOs.PrintJobInput input) {
        Long collegeId = TenantContext.getCollegeId();
        PrintPricing pricing = getOrCreateDefaultPricing(collegeId);

        Map<String, Object> breakdown = calculatePriceBreakdown(pricing, input);
        return ResponseEntity.ok(breakdown);
    }

    // ─── Submit a new print job with auto-calculated price ────────────
    @PostMapping("/jobs")
    public ResponseEntity<?> submitJob(@RequestBody PrintDTOs.PrintJobInput input) {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();
        College college = collegeRepository.findById(collegeId).orElseThrow();

        PrintPricing pricing = getOrCreateDefaultPricing(collegeId);
        Map<String, Object> breakdown = calculatePriceBreakdown(pricing, input);

        BigDecimal totalCost = (BigDecimal) breakdown.get("totalCost");
        BigDecimal perPageRate = (BigDecimal) breakdown.get("perPageRate");
        BigDecimal paperSizeMultiplier = (BigDecimal) breakdown.get("paperSizeMultiplier");
        BigDecimal doubleSidedDiscount = (BigDecimal) breakdown.get("doubleSidedDiscount");
        BigDecimal bindingCharge = (BigDecimal) breakdown.get("bindingCharge");
        BigDecimal urgentSurcharge = (BigDecimal) breakdown.get("urgentSurcharge");

        int totalPages = Math.max(1, input.getTotalPages() != null ? input.getTotalPages() : 1);
        int copies = Math.max(1, input.getCopies() != null ? input.getCopies() : 1);

        String txnRef = "PRINT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        boolean payLater = "PAY_ON_COLLECTION".equalsIgnoreCase(input.getPaymentMethod());
        String paymentStatus = payLater ? "PAY_ON_COLLECTION" : "PENDING";
        String txnStatus = "PENDING";

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
                .perPageRate(perPageRate)
                .paperSizeMultiplier(paperSizeMultiplier)
                .doubleSidedDiscount(doubleSidedDiscount)
                .bindingCharge(bindingCharge)
                .urgentSurcharge(urgentSurcharge)
                .isUrgent(Boolean.TRUE.equals(input.getIsUrgent()))
                .needsBinding(Boolean.TRUE.equals(input.getNeedsBinding()))
                .orientation(input.getOrientation() != null ? input.getOrientation() : "PORTRAIT")
                .paperQuality(input.getPaperQuality() != null ? input.getPaperQuality() : "STANDARD_75GSM")
                .pageRange(input.getPageRange() != null ? input.getPageRange() : "ALL")
                .specialInstructions(input.getSpecialInstructions())
                .paymentMethod(payLater ? "PAY_ON_COLLECTION" : "PAY_NOW")
                .status(payLater ? "QUEUED" : "PAYMENT_PENDING")
                .paymentStatus(paymentStatus)
                .upiTxnRef(txnRef)
                .build();

        printJobRepository.save(job);

        transactionRepository.save(Transaction.builder()
                .college(college)
                .student(student)
                .type("PRINT")
                .amount(totalCost)
                .status(txnStatus)
                .upiTxnRef(txnRef)
                .referenceId(String.valueOf(job.getId()))
                .build());

        String notifMsg = payLater
                ? "Your document " + job.getFileName() + " (" + totalPages + " pages, " +
                  copies + " copies) is queued. Payable on collection at counter: ₹" + totalCost.setScale(2, RoundingMode.HALF_UP)
                : "Your document " + job.getFileName() + " (" + totalPages + " pages, " +
                  copies + " copies) is queued. Total paid: ₹" + totalCost.setScale(2, RoundingMode.HALF_UP);

        notificationRepository.save(Notification.builder()
                .college(college)
                .student(student)
                .module("PRINT")
                .title(payLater ? "Print Job Queued (Pay on Pickup)" : "Print Job Submitted")
                .message(notifMsg)
                .build());

        String upiIntent = null;
        if (!payLater) {
            String upiId = (pricing.getPrinterUpiId() != null && !pricing.getPrinterUpiId().isBlank())
                    ? pricing.getPrinterUpiId() : "9398979155-1@superyes";
            upiIntent = String.format("upi://pay?pa=%s&pn=%s+PrintShop&am=%.2f&tn=PRINT-%s&tr=%s",
                    upiId, college.getName().replaceAll(" ", ""), totalCost, job.getId(), txnRef);
        }

        return ResponseEntity.ok(mapToJobDTO(job, upiIntent));
    }

    @PostMapping("/jobs/{jobId}/verify-payment")
    public ResponseEntity<?> verifyPrintPayment(@PathVariable Long jobId, @RequestBody(required = false) Map<String, String> body) {
        PrintJob job = printJobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Print job not found"));
        job.setPaymentStatus("PAID");
        job.setStatus("QUEUED");
        job.setUpdatedAt(LocalDateTime.now());

        String utr = (body != null && body.containsKey("utr")) ? body.get("utr") : "UTR-" + System.currentTimeMillis();
        job.setUpiTxnRef(utr);
        printJobRepository.save(job);

        Optional<Transaction> existingTxn = transactionRepository.findByCollegeIdAndReferenceId(job.getCollege().getId(), String.valueOf(job.getId()));
        if (existingTxn.isPresent()) {
            Transaction txn = existingTxn.get();
            txn.setStatus("PAID");
            txn.setUpiTxnRef(utr);
            transactionRepository.save(txn);
        }

        notificationRepository.save(Notification.builder()
                .college(job.getCollege())
                .student(job.getStudent())
                .module("PRINT")
                .title("Print Payment Confirmed")
                .message("Payment of ₹" + job.getTotalCost() + " confirmed for Print Job #" + job.getId() + " via UPI (" + utr + ").")
                .build());

        Map<String, Object> response = new HashMap<>();
        response.put("job", mapToJobDTO(job, null));
        response.put("status", "SUCCESS");
        response.put("message", "Payment confirmed and received successfully");
        response.put("transactionId", utr);

        return ResponseEntity.ok(response);
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

    // ─── Staff: Get pricing for configuration ────────────────────────
    @GetMapping("/staff/pricing")
    @PreAuthorize("hasAuthority('PRINT_VIEW_QUEUE') or hasAuthority('PRINT_MANAGE_PRICING') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<PrintDTOs.PrintPricingDTO> getStaffPricing() {
        Long collegeId = TenantContext.getCollegeId();
        if (collegeId == null) {
            collegeId = collegeRepository.findAll().stream().findFirst().map(College::getId).orElse(1L);
        }
        PrintPricing pricing = getOrCreateDefaultPricing(collegeId);
        return ResponseEntity.ok(mapToPricingDTO(pricing));
    }

    // ─── Staff: Update pricing configuration ─────────────────────────
    @PutMapping("/staff/pricing")
    @PreAuthorize("hasAuthority('PRINT_UPDATE_JOB_STATUS') or hasAuthority('PRINT_MANAGE_PRICING') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<?> updateStaffPricing(@RequestBody PrintDTOs.PricingUpdateInput input) {
        Long collegeId = TenantContext.getCollegeId();
        if (collegeId == null) {
            collegeId = collegeRepository.findAll().stream().findFirst().map(College::getId).orElse(1L);
        }
        final Long effectiveCollegeId = collegeId;
        College college = collegeRepository.findById(effectiveCollegeId)
                .orElseGet(() -> collegeRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No college found")));

        PrintPricing pricing = printPricingRepository.findByCollegeId(effectiveCollegeId)
                .orElseGet(() -> PrintPricing.builder().college(college).build());

        if (input.getBwPerPage() != null) pricing.setBwPerPage(input.getBwPerPage());
        if (input.getColorPerPage() != null) pricing.setColorPerPage(input.getColorPerPage());
        if (input.getA4Multiplier() != null) pricing.setA4Multiplier(input.getA4Multiplier());
        if (input.getA3Multiplier() != null) pricing.setA3Multiplier(input.getA3Multiplier());
        if (input.getLetterMultiplier() != null) pricing.setLetterMultiplier(input.getLetterMultiplier());
        if (input.getDoubleSidedDiscountPercent() != null) pricing.setDoubleSidedDiscountPercent(input.getDoubleSidedDiscountPercent());
        if (input.getBindingCharge() != null) pricing.setBindingCharge(input.getBindingCharge());
        if (input.getUrgentSurchargePercent() != null) pricing.setUrgentSurchargePercent(input.getUrgentSurchargePercent());
        if (input.getPrinterShopName() != null) pricing.setPrinterShopName(input.getPrinterShopName());
        if (input.getPrinterContactPerson() != null) pricing.setPrinterContactPerson(input.getPrinterContactPerson());
        if (input.getPrinterPhone() != null) pricing.setPrinterPhone(input.getPrinterPhone());
        if (input.getPrinterWhatsapp() != null) pricing.setPrinterWhatsapp(input.getPrinterWhatsapp());
        if (input.getPrinterShopLocation() != null) pricing.setPrinterShopLocation(input.getPrinterShopLocation());
        if (input.getPrinterUpiId() != null) pricing.setPrinterUpiId(input.getPrinterUpiId());

        printPricingRepository.save(pricing);

        return ResponseEntity.ok(Map.of(
                "message", "Print pricing updated successfully",
                "pricing", mapToPricingDTO(pricing)
        ));
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private PrintPricing getOrCreateDefaultPricing(Long collegeId) {
        if (collegeId == null) {
            collegeId = collegeRepository.findAll().stream().findFirst().map(College::getId).orElse(1L);
        }
        return printPricingRepository.findByCollegeId(collegeId)
                .orElse(PrintPricing.builder()
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
                        .printerUpiId("printshop@mallareddyuniversity.ac.in")
                        .build());
    }

    /**
     * Central price calculation engine.
     */
    private Map<String, Object> calculatePriceBreakdown(PrintPricing pricing, PrintDTOs.PrintJobInput input) {
        BigDecimal perPageRate = Boolean.TRUE.equals(input.getIsColor())
                ? pricing.getColorPerPage() : pricing.getBwPerPage();

        // Paper quality adjustment
        String paperQuality = input.getPaperQuality() != null ? input.getPaperQuality() : "STANDARD_75GSM";
        if ("BOND_100GSM".equalsIgnoreCase(paperQuality)) {
            perPageRate = perPageRate.add(new BigDecimal("1.00"));
        } else if ("GLOSSY".equalsIgnoreCase(paperQuality)) {
            perPageRate = perPageRate.add(new BigDecimal("4.00"));
        }

        BigDecimal paperSizeMultiplier;
        String paperSize = input.getPaperSize() != null ? input.getPaperSize() : "A4";
        switch (paperSize.toUpperCase()) {
            case "A3":
                paperSizeMultiplier = pricing.getA3Multiplier();
                break;
            case "LETTER":
                paperSizeMultiplier = pricing.getLetterMultiplier();
                break;
            default:
                paperSizeMultiplier = pricing.getA4Multiplier();
                break;
        }

        int totalPages = Math.max(1, input.getTotalPages() != null ? input.getTotalPages() : 1);
        int copies = Math.max(1, input.getCopies() != null ? input.getCopies() : 1);

        // Base cost = rate × multiplier × pages × copies
        BigDecimal baseCost = perPageRate
                .multiply(paperSizeMultiplier)
                .multiply(BigDecimal.valueOf(totalPages))
                .multiply(BigDecimal.valueOf(copies));

        // Double-sided discount
        BigDecimal doubleSidedDiscount = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(input.getIsDoubleSided())) {
            doubleSidedDiscount = baseCost
                    .multiply(pricing.getDoubleSidedDiscountPercent())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }

        BigDecimal subtotal = baseCost.subtract(doubleSidedDiscount);

        // Urgent surcharge
        BigDecimal urgentSurcharge = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(input.getIsUrgent())) {
            urgentSurcharge = subtotal
                    .multiply(pricing.getUrgentSurchargePercent())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }

        // Binding charge (flat per copy)
        BigDecimal bindingChg = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(input.getNeedsBinding())) {
            bindingChg = pricing.getBindingCharge().multiply(BigDecimal.valueOf(copies));
        }

        BigDecimal totalCost = subtotal.add(urgentSurcharge).add(bindingChg)
                .setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("perPageRate", perPageRate);
        breakdown.put("paperSizeMultiplier", paperSizeMultiplier);
        breakdown.put("totalPages", totalPages);
        breakdown.put("copies", copies);
        breakdown.put("baseCost", baseCost.setScale(2, RoundingMode.HALF_UP));
        breakdown.put("isDoubleSided", Boolean.TRUE.equals(input.getIsDoubleSided()));
        breakdown.put("doubleSidedDiscountPercent", pricing.getDoubleSidedDiscountPercent());
        breakdown.put("doubleSidedDiscount", doubleSidedDiscount);
        breakdown.put("subtotal", subtotal.setScale(2, RoundingMode.HALF_UP));
        breakdown.put("isUrgent", Boolean.TRUE.equals(input.getIsUrgent()));
        breakdown.put("urgentSurchargePercent", pricing.getUrgentSurchargePercent());
        breakdown.put("urgentSurcharge", urgentSurcharge);
        breakdown.put("needsBinding", Boolean.TRUE.equals(input.getNeedsBinding()));
        breakdown.put("bindingCharge", bindingChg);
        breakdown.put("totalCost", totalCost);
        breakdown.put("paperQuality", paperQuality);
        breakdown.put("orientation", input.getOrientation() != null ? input.getOrientation() : "PORTRAIT");
        breakdown.put("pageRange", input.getPageRange() != null ? input.getPageRange() : "ALL");
        return breakdown;
    }

    private PrintDTOs.PrintPricingDTO mapToPricingDTO(PrintPricing p) {
        return PrintDTOs.PrintPricingDTO.builder()
                .bwPerPage(p.getBwPerPage())
                .colorPerPage(p.getColorPerPage())
                .a4Multiplier(p.getA4Multiplier())
                .a3Multiplier(p.getA3Multiplier())
                .letterMultiplier(p.getLetterMultiplier())
                .doubleSidedDiscountPercent(p.getDoubleSidedDiscountPercent())
                .bindingCharge(p.getBindingCharge())
                .urgentSurchargePercent(p.getUrgentSurchargePercent())
                .printerShopName(p.getPrinterShopName())
                .printerContactPerson(p.getPrinterContactPerson())
                .printerPhone(p.getPrinterPhone())
                .printerWhatsapp(p.getPrinterWhatsapp())
                .printerShopLocation(p.getPrinterShopLocation())
                .printerUpiId(p.getPrinterUpiId())
                .build();
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
                .perPageRate(j.getPerPageRate())
                .paperSizeMultiplier(j.getPaperSizeMultiplier())
                .doubleSidedDiscount(j.getDoubleSidedDiscount())
                .bindingCharge(j.getBindingCharge())
                .urgentSurcharge(j.getUrgentSurcharge())
                .isUrgent(j.getIsUrgent())
                .needsBinding(j.getNeedsBinding())
                .orientation(j.getOrientation())
                .paperQuality(j.getPaperQuality())
                .pageRange(j.getPageRange())
                .specialInstructions(j.getSpecialInstructions())
                .paymentMethod(j.getPaymentMethod())
                .status(j.getStatus())
                .paymentStatus(j.getPaymentStatus())
                .upiTxnRef(j.getUpiTxnRef())
                .upiIntentUrl(upiIntent)
                .createdAt(j.getCreatedAt())
                .build();
    }
}
