package com.campus.utility.security;

public class TenantContext {
    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    public static void setCollegeId(Long collegeId) {
        CURRENT_TENANT.set(collegeId);
    }

    public static Long getCollegeId() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
