package com.campus.utility.controller;

import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import com.campus.utility.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/student")
public class StudentProfileController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final PrintJobRepository printJobRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final OutpassRequestRepository outpassRequestRepository;

    public StudentProfileController(StudentRepository studentRepository,
                                    UserRepository userRepository,
                                    OrderRepository orderRepository,
                                    BorrowRequestRepository borrowRequestRepository,
                                    PrintJobRepository printJobRepository,
                                    LeaveRequestRepository leaveRequestRepository,
                                    OutpassRequestRepository outpassRequestRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.printJobRepository = printJobRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.outpassRequestRepository = outpassRequestRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();

        Map<String, Object> map = new HashMap<>();
        map.put("id", student.getId());
        map.put("fullName", user.getFullName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("rollNumber", student.getRollNumber());
        map.put("department", student.getDepartment());
        map.put("year", student.getYear());
        map.put("hostelBlock", student.getHostelBlock());
        map.put("roomNumber", student.getRoomNumber());
        map.put("emergencyContact", student.getEmergencyContact());
        map.put("collegeName", student.getCollege() != null ? student.getCollege().getName() : "Campus");

        return ResponseEntity.ok(map);
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();

        if (body.containsKey("phone")) {
            user.setPhone(body.get("phone"));
            userRepository.save(user);
        }
        if (body.containsKey("emergencyContact")) {
            student.setEmergencyContact(body.get("emergencyContact"));
            studentRepository.save(student);
        }

        return getProfile();
    }

    @GetMapping("/active-feed")
    public ResponseEntity<List<Map<String, Object>>> getActiveFeed() {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();

        List<Map<String, Object>> feed = new ArrayList<>();

        // 1. Active Canteen Orders
        List<Order> activeOrders = orderRepository.findByCollegeIdAndStudentIdAndStatusIn(collegeId, student.getId(), List.of("PLACED", "PREPARING", "READY"));
        for (Order o : activeOrders) {
            feed.add(Map.of(
                    "id", "canteen-" + o.getId(),
                    "module", "CANTEEN",
                    "title", "Order #" + o.getOrderNumber(),
                    "subtitle", o.getItems().size() + " items • Total ₹" + o.getTotalAmount(),
                    "status", o.getStatus(),
                    "timestamp", o.getCreatedAt()
            ));
        }

        // 2. Active Sports Borrows
        List<BorrowRequest> activeBorrows = borrowRequestRepository.findByCollegeIdAndStudentIdAndStatusIn(collegeId, student.getId(), List.of("PENDING", "APPROVED", "OVERDUE"));
        for (BorrowRequest b : activeBorrows) {
            feed.add(Map.of(
                    "id", "sports-" + b.getId(),
                    "module", "SPORTS",
                    "title", b.getEquipment().getName(),
                    "subtitle", "Due: " + b.getExpectedReturnAt().toString().replace("T", " "),
                    "status", b.getStatus(),
                    "timestamp", b.getCreatedAt()
            ));
        }

        // 3. Active Print Jobs
        List<PrintJob> activeJobs = printJobRepository.findByCollegeIdAndStudentIdAndStatusIn(collegeId, student.getId(), List.of("QUEUED", "PRINTING", "READY"));
        for (PrintJob p : activeJobs) {
            feed.add(Map.of(
                    "id", "print-" + p.getId(),
                    "module", "PRINT",
                    "title", p.getFileName(),
                    "subtitle", p.getCopies() + " copies • ₹" + p.getTotalCost(),
                    "status", p.getStatus(),
                    "timestamp", p.getCreatedAt()
            ));
        }

        // 4. Active Leave / Outpass
        List<LeaveRequest> activeLeaves = leaveRequestRepository.findByCollegeIdAndStudentIdOrderByCreatedAtDesc(collegeId, student.getId());
        for (LeaveRequest l : activeLeaves) {
            if ("PENDING".equals(l.getStatus())) {
                feed.add(Map.of(
                        "id", "leave-" + l.getId(),
                        "module", "LEAVE",
                        "title", "Leave: " + l.getDestination(),
                        "subtitle", l.getFromDate() + " to " + l.getToDate(),
                        "status", l.getStatus(),
                        "timestamp", l.getCreatedAt()
                ));
            }
        }

        List<OutpassRequest> activeOutpasses = outpassRequestRepository.findByCollegeIdAndStudentIdOrderByCreatedAtDesc(collegeId, student.getId());
        for (OutpassRequest op : activeOutpasses) {
            if (List.of("PENDING", "APPROVED", "CURRENTLY_OUT", "OVERDUE").contains(op.getStatus())) {
                feed.add(Map.of(
                        "id", "outpass-" + op.getId(),
                        "module", "OUTPASS",
                        "title", op.getType() + " Outpass: " + op.getDestinationPurpose(),
                        "subtitle", "Return by: " + op.getExpectedReturnTime().toString().replace("T", " "),
                        "status", op.getStatus(),
                        "timestamp", op.getCreatedAt()
                ));
            }
        }

        feed.sort((a, b) -> ((java.time.LocalDateTime) b.get("timestamp")).compareTo((java.time.LocalDateTime) a.get("timestamp")));

        return ResponseEntity.ok(feed);
    }
}
