#Stage 1
FROM openjdk:8-alpine as maven
WORKDIR /app
COPY pom.xml pom.xml
COPY .mvn .mvn
COPY mvnw mvnw
RUN ./mvnw dependency:resolve
COPY ./src ./src
RUN ./mvnw package && cp target/*.jar app.jar

#Stage 2
FROM openjdk:8-alpine
WORKDIR /app
COPY --from=maven /app/app.jar ./app.jar
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
