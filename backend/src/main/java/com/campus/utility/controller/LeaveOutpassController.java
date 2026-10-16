package com.campus.utility.controller;

import com.campus.utility.dto.LeaveOutpassDTOs;
import com.campus.utility.entity.*;
import com.campus.utility.repository.*;
import com.campus.utility.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@Transactional
@RequestMapping("/api/v1/requests")
public class LeaveOutpassController {

    private final LeaveRequestRepository leaveRequestRepository;
    private final OutpassRequestRepository outpassRequestRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final NotificationRepository notificationRepository;

    public LeaveOutpassController(LeaveRequestRepository leaveRequestRepository,
                                  OutpassRequestRepository outpassRequestRepository,
                                  StudentRepository studentRepository,
                                  UserRepository userRepository,
                                  CollegeRepository collegeRepository,
                                  NotificationRepository notificationRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.outpassRequestRepository = outpassRequestRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.notificationRepository = notificationRepository;
    }

    @PostMapping("/leave")
    public ResponseEntity<?> submitLeave(@RequestBody LeaveOutpassDTOs.LeaveInput input) {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();
        College college = collegeRepository.findById(collegeId).orElseThrow();

        LeaveRequest req = LeaveRequest.builder()
                .college(college)
                .student(student)
                .reason(input.getReason())
                .fromDate(input.getFromDate())
                .toDate(input.getToDate())
                .destination(input.getDestination())
                .attachmentUrl(input.getAttachmentUrl())
                .status("PENDING")
                .build();

        leaveRequestRepository.save(req);

        notificationRepository.save(Notification.builder()
                .college(college)
                .student(student)
                .module("LEAVE")
                .title("Leave Letter Submitted")
                .message("Your leave request from " + input.getFromDate() + " to " + input.getToDate() + " has been sent to Warden.")
                .build());

        return ResponseEntity.ok(mapToLeaveDTO(req));
    }

    @PostMapping("/outpass")
    public ResponseEntity<?> submitOutpass(@RequestBody LeaveOutpassDTOs.OutpassInput input) {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();
        College college = collegeRepository.findById(collegeId).orElseThrow();

        OutpassRequest req = OutpassRequest.builder()
                .college(college)
                .student(student)
                .type(input.getType())
                .outTime(input.getOutTime())
                .expectedReturnTime(input.getExpectedReturnTime())
                .destinationPurpose(input.getDestinationPurpose())
                .status("PENDING")
                .build();

        outpassRequestRepository.save(req);

        notificationRepository.save(Notification.builder()
                .college(college)
                .student(student)
                .module("OUTPASS")
                .title("Outpass Request Submitted")
                .message("Your " + input.getType() + " outpass request for " + input.getDestinationPurpose() + " is pending warden review.")
                .build());

        return ResponseEntity.ok(mapToOutpassDTO(req));
    }

    @GetMapping("/my/leave")
    public ResponseEntity<List<LeaveOutpassDTOs.LeaveRequestDTO>> getMyLeave() {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();

        List<LeaveRequest> list = leaveRequestRepository.findByCollegeIdAndStudentIdOrderByCreatedAtDesc(collegeId, student.getId());
        List<LeaveOutpassDTOs.LeaveRequestDTO> dtos = list.stream().map(this::mapToLeaveDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/my/outpass")
    public ResponseEntity<List<LeaveOutpassDTOs.OutpassRequestDTO>> getMyOutpass() {
        Long collegeId = TenantContext.getCollegeId();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow();

        List<OutpassRequest> list = outpassRequestRepository.findByCollegeIdAndStudentIdOrderByCreatedAtDesc(collegeId, student.getId());

        LocalDateTime now = LocalDateTime.now();
        for (OutpassRequest o : list) {
            if ("APPROVED".equals(o.getStatus()) && now.isAfter(o.getOutTime()) && (o.getActualReturnTime() == null)) {
                if (now.isAfter(o.getExpectedReturnTime())) {
                    o.setStatus("OVERDUE");
                } else {
                    o.setStatus("CURRENTLY_OUT");
                }
                outpassRequestRepository.save(o);
            }
        }

        List<LeaveOutpassDTOs.OutpassRequestDTO> dtos = list.stream().map(this::mapToOutpassDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/warden/leave/pending")
    @PreAuthorize("hasAuthority('LEAVE_OUTPASS_APPROVE_REJECT_REQUEST') or hasAuthority('LEAVE_OUTPASS_VIEW_REQUESTS') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<List<LeaveOutpassDTOs.LeaveRequestDTO>> getWardenPendingLeave() {
        Long collegeId = TenantContext.getCollegeId();
        List<LeaveRequest> list = leaveRequestRepository.findByCollegeIdAndStatusOrderByCreatedAtAsc(collegeId, "PENDING");
        List<LeaveOutpassDTOs.LeaveRequestDTO> dtos = list.stream().map(this::mapToLeaveDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/warden/outpass/pending")
    @PreAuthorize("hasAuthority('LEAVE_OUTPASS_APPROVE_REJECT_REQUEST') or hasAuthority('LEAVE_OUTPASS_VIEW_REQUESTS') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<List<LeaveOutpassDTOs.OutpassRequestDTO>> getWardenPendingOutpass() {
        Long collegeId = TenantContext.getCollegeId();
        List<OutpassRequest> list = outpassRequestRepository.findByCollegeIdAndStatusOrderByCreatedAtAsc(collegeId, "PENDING");
        List<LeaveOutpassDTOs.OutpassRequestDTO> dtos = list.stream().map(this::mapToOutpassDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/warden/leave/{id}/review")
    @PreAuthorize("hasAuthority('LEAVE_OUTPASS_APPROVE_REJECT_REQUEST') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<?> reviewLeave(@PathVariable Long id, @RequestBody LeaveOutpassDTOs.ReviewDecision decision) {
        LeaveRequest req = leaveRequestRepository.findById(id).orElseThrow();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User warden = userRepository.findByUsername(username).orElseThrow();

        String status = "APPROVE".equalsIgnoreCase(decision.getAction()) ? "APPROVED" : "REJECTED";
        req.setStatus(status);
        req.setWardenRemarks(decision.getRemarks());
        req.setReviewedBy(warden);
        leaveRequestRepository.save(req);

        notificationRepository.save(Notification.builder()
                .college(req.getCollege())
                .student(req.getStudent())
                .module("LEAVE")
                .title("Leave Letter " + status)
                .message("Your leave request has been " + status.toLowerCase() + "." +
                        (decision.getRemarks() != null ? " Warden remarks: " + decision.getRemarks() : ""))
                .build());

        return ResponseEntity.ok(mapToLeaveDTO(req));
    }

    @PatchMapping("/warden/outpass/{id}/review")
    @PreAuthorize("hasAuthority('LEAVE_OUTPASS_APPROVE_REJECT_REQUEST') or hasAuthority('ROLE_COLLEGE_ADMIN') or hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<?> reviewOutpass(@PathVariable Long id, @RequestBody LeaveOutpassDTOs.ReviewDecision decision) {
        OutpassRequest req = outpassRequestRepository.findById(id).orElseThrow();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User warden = userRepository.findByUsername(username).orElseThrow();

        String status = "APPROVE".equalsIgnoreCase(decision.getAction()) ? "APPROVED" : "REJECTED";
        req.setStatus(status);
        req.setWardenRemarks(decision.getRemarks());
        req.setReviewedBy(warden);
        outpassRequestRepository.save(req);

        notificationRepository.save(Notification.builder()
                .college(req.getCollege())
                .student(req.getStudent())
                .module("OUTPASS")
                .title("Outpass Request " + status)
                .message("Your outpass request has been " + status.toLowerCase() + "." +
                        (decision.getRemarks() != null ? " Warden remarks: " + decision.getRemarks() : ""))
                .build());

        return ResponseEntity.ok(mapToOutpassDTO(req));
    }

    private LeaveOutpassDTOs.LeaveRequestDTO mapToLeaveDTO(LeaveRequest l) {
        return LeaveOutpassDTOs.LeaveRequestDTO.builder()
                .id(l.getId())
                .studentName(l.getStudent().getUser().getFullName())
                .rollNumber(l.getStudent().getRollNumber())
                .hostelBlock(l.getStudent().getHostelBlock())
                .roomNumber(l.getStudent().getRoomNumber())
                .reason(l.getReason())
                .fromDate(l.getFromDate())
                .toDate(l.getToDate())
                .destination(l.getDestination())
                .attachmentUrl(l.getAttachmentUrl())
                .status(l.getStatus())
                .wardenRemarks(l.getWardenRemarks())
                .createdAt(l.getCreatedAt())
                .build();
    }

    private LeaveOutpassDTOs.OutpassRequestDTO mapToOutpassDTO(OutpassRequest o) {
        return LeaveOutpassDTOs.OutpassRequestDTO.builder()
                .id(o.getId())
                .studentName(o.getStudent().getUser().getFullName())
                .rollNumber(o.getStudent().getRollNumber())
                .hostelBlock(o.getStudent().getHostelBlock())
                .roomNumber(o.getStudent().getRoomNumber())
                .type(o.getType())
                .outTime(o.getOutTime())
                .expectedReturnTime(o.getExpectedReturnTime())
                .actualReturnTime(o.getActualReturnTime())
                .destinationPurpose(o.getDestinationPurpose())
                .status(o.getStatus())
                .wardenRemarks(o.getWardenRemarks())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
