# Stage 1: Build
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven configuration, wrapper script, and source code
COPY .mvn .mvn
COPY mvnw mvnw.cmd pom.xml ./
COPY src src

# Make Maven wrapper executable and build application without tests
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy executable jar from build stage
COPY --from=build /app/target/*.jar /app/app.jar

# Expose backend service port
EXPOSE 8080

# Configure container execution
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
