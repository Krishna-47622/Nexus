# Multi-stage Dockerfile for Spring Boot 3 / Java 21 Backend
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom and pre-fetch dependencies for fast layered caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source and build JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Production JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/utility-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]
