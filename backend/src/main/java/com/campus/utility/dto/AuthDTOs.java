package com.campus.utility.dto;

import lombok.*;
import java.util.List;

public class AuthDTOs {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
        private Long collegeId;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LoginResponse {
        private String token;
        private Long userId;
        private String username;
        private String fullName;
        private String email;
        private Long collegeId;
        private String collegeName;
        private String primaryRole;
        private Boolean mustChangePassword;
        private List<String> permissions;
    }

    @Data
    public static class SetPasswordRequest {
        private String oldPassword;
        private String newPassword;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CollegeResponse {
        private Long id;
        private String name;
        private String domain;
        private String logoUrl;
        private String address;
        private Long studentCount;
    }
}
