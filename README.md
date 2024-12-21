# Software Architecture for Izistore Platform API

## 1. **Overview**

Izistore is a platform that allows users to generate multiple e-commerce stores. Users can subscribe to a store and manage their data via a multi-tenant architecture. The proposed backend will leverage:

- **Microservice Architecture**
- **NestJS** (Backend Framework)
- **Redis** (Inter-service communication)
- **Auth0** (Authentication with Multi-tenant DB isolation)
- **NX** (Monorepo for managing services)
- **Docker** (Containerization for deployment)
- **GitHub Actions** (CI/CD Workflow)

---

## 2. **Key Requirements**

1. **Multi-tenant Authentication**
   - Use **Auth0** for managing authentication and authorization.
   - Each tenant has an isolated database.
   - Auth0 to issue tokens, which are validated within microservices.
2. **Microservices**
   - Each business logic encapsulated into a separate microservice.
   - Use **Redis** as the broker for inter-service communication.
3. **Monorepo Setup**
   - Use **NX** to organize and manage services in a scalable way.
4. **CI/CD Pipeline**
   - GitHub Actions to build, test, and deploy the services with Docker.
5. **Containerization**
   - Use **Docker** to deploy the microservices.
6. **Local Development Support**
   - Use volume mounts and override settings to enable hot-reloading during development.

---

## 3. **System Architecture**

### 3.1 **Microservices**

| Microservice     | Responsibilities                                                                   |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Auth Service** | Handles user authentication using Auth0, tenant-based logic, and token validation. |
| **User Service** | Manages user profiles, subscription, and store metadata. Communicates via Redis.   |

### 3.2 **API Gateway**

- The **API Gateway** only validates incoming requests and routes them to their respective microservices.
- Authentication tokens are validated via the Auth Service.
- Redis is used for inter-service communication.

### 3.3 **Communication**

- **API Gateway**: Central entry point for client requests. It routes requests to the relevant microservices.
- **Redis**: Pub/Sub for real-time communication between services.
- **NestJS Microservices**: Microservices communicate through Redis transport.

---

## 4. **Monorepo Structure with NX**

```
izistore-backend/                # Root workspace
├── apps/                       # API Gateway and Microservices
│   ├── api-gateway/            # API Gateway
│   ├── auth-service/           # Authentication Service
│   ├── user-service/           # User Management Service
│   ├── store-service/          # Store Management Service
│   └── ...                     # Other services
│
├── libs/                       # Shared libraries
│   ├── common/                 # Common utilities
│   ├── redis-client/           # Redis Pub/Sub utility
│   ├── auth/                   # Authentication logic shared across services
│
├── docker/                     # Docker configurations
└── .github/                    # GitHub workflows
```

---

## 5. **Separate CI and CD Pipelines with GitHub Actions**

The CI and CD workflows are now split into two separate files for clarity and modularity.
