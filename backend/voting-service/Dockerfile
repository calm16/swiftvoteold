# syntax=docker/dockerfile:1.7
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY eureka-server/pom.xml eureka-server/pom.xml
COPY config-server/pom.xml config-server/pom.xml
COPY api-gateway/pom.xml api-gateway/pom.xml
COPY auth-service/pom.xml auth-service/pom.xml
COPY event-service/pom.xml event-service/pom.xml
COPY contestant-service/pom.xml contestant-service/pom.xml
COPY voting-service/pom.xml voting-service/pom.xml
COPY payment-service/pom.xml payment-service/pom.xml
COPY notification-service/pom.xml notification-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -q -pl voting-service -am dependency:go-offline
COPY voting-service/src voting-service/src
RUN --mount=type=cache,target=/root/.m2 mvn -q -pl voting-service -am package -DskipTests
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/voting-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
