package com.campus.utility;

import com.campus.utility.dto.AuthDTOs;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthenticationIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void freshlyIssuedJwtAuthenticatesProtectedPlatformRoute() {
        AuthDTOs.LoginRequest request = new AuthDTOs.LoginRequest();
        request.setUsername("admin");
        request.setPassword("1234");

        ResponseEntity<Map> loginResponse = restTemplate.postForEntity(
                url("/api/v1/auth/platform-login"), request, Map.class);

        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        String token = (String) loginResponse.getBody().get("token");
        assertNotNull(token);
        assertFalse(token.isBlank());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<Map> overviewResponse = restTemplate.exchange(
                url("/api/v1/platform-admin/overview"),
                org.springframework.http.HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class);

        assertEquals(HttpStatus.OK, overviewResponse.getStatusCode());
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
