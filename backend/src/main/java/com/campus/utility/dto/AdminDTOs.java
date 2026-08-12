package com.campus.utility.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDTOs {

    @Data
    public static class StaffAccountInput {
        private String fullName;
        private String email;
        private String roleName;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class StaffAccountDTO {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String roleName;
        private Boolean isActive;
        private LocalDateTime createdAt;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class StudentImportRecord {
        private String rollNumber;
        private String fullName;
        private String email;
        private String department;
        private String year;
        private String hostelBlock;
        private String roomNumber;
        private String tempPassword;
        private String status;
        private String error;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class AnalyticsDTO {
        private Long totalStudents;
        private Long activeOrdersToday;
        private Long pendingApprovals;
        private BigDecimal totalRevenueMonth;
        private List<CategoryStat> topMenuItems;
        private List<CategoryStat> topEquipmentBorrows;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CategoryStat {
        private String name;
        private Long count;
    }

    @Data
    public static class CollegeCreateInput {
        private String name;
        private String domain;
        private String logoUrl;
        private String address;
        private String adminName;
        private String adminEmail;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RoleDTO {
        private Long id;
        private String name;
        private List<String> permissions;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PlatformOverviewDTO {
        private Long totalColleges;
        private Long totalStudentsPlatform;
        private Long totalStaffPlatform;
        private String systemHealth;
        private List<AuthDTOs.CollegeResponse> colleges;
    }
}
