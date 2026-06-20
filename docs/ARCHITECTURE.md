# System Architecture

## Overview

DigiTracker is a modular, multi-tenant SaaS platform built for horizontal scalability and future feature expansion.

## High-Level Architecture

```mermaid
flowchart TB
    subgraph clients [Client Layer]
        MA[Flutter Mobile App]
        WA[Admin Web Dashboard]
        SA[Super Admin Portal]
    end

    subgraph gateway [API Gateway Layer]
        LB[Load Balancer / Nginx]
        RL[Rate Limiter]
    end

    subgraph api [Application Layer]
        AUTH[Auth Service]
        TENANT[Tenant Middleware]
        MOD[Module Service]
        ENTRY[Entry Service]
        ANALYTICS[Analytics Engine]
        REWARD[Reward Service]
        REPORT[Report Service]
        NOTIFY[Notification Service]
    end

    subgraph data [Data Layer]
        MONGO[(MongoDB)]
        REDIS[(Redis Cache)]
        S3[(Object Storage)]
    end

    subgraph external [External Services]
        FCM[Firebase Cloud Messaging]
        SMTP[Email Service]
    end

    MA --> LB
    WA --> LB
    SA --> LB
    LB --> RL
    RL --> AUTH
    AUTH --> TENANT
    TENANT --> MOD
    TENANT --> ENTRY
    TENANT --> ANALYTICS
    TENANT --> REWARD
    TENANT --> REPORT
    TENANT --> NOTIFY
    MOD --> MONGO
    ENTRY --> MONGO
    ANALYTICS --> MONGO
    ANALYTICS --> REDIS
    REWARD --> MONGO
    REPORT --> MONGO
    REPORT --> S3
    NOTIFY --> FCM
    AUTH --> SMTP
```

## Multi-Tenant Strategy

**Approach:** Shared database with tenant isolation via `businessId` on every document.

| Aspect | Implementation |
|--------|----------------|
| Isolation | `businessId` field on all tenant-scoped collections |
| Indexing | Compound indexes: `{ businessId: 1, ... }` |
| Middleware | `tenantMiddleware` injects `businessId` from JWT |
| Super Admin | Bypasses tenant filter with explicit `businessId` param |
| Subscriptions | Plan limits enforced at service layer |

## Backend Architecture (MVC + Repository Pattern)

```
Request → Router → Middleware → Controller → Service → Repository → Model → MongoDB
                                    ↓
                               Validator
```

### Layers

| Layer | Responsibility |
|-------|----------------|
| **Routes** | HTTP endpoint definitions |
| **Middleware** | Auth, tenant, validation, error handling |
| **Controllers** | Request/response handling |
| **Services** | Business logic, orchestration |
| **Repositories** | Data access abstraction |
| **Models** | Mongoose schemas |
| **Validators** | Joi request validation |

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth API
    participant DB as MongoDB

    C->>A: POST /auth/login
    A->>DB: Verify credentials
    DB-->>A: User + Business
    A-->>C: accessToken (15m) + refreshToken (7d)

    C->>A: API Request + Bearer token
    A->>A: Verify JWT + extract role/businessId
    A-->>C: Response

    C->>A: POST /auth/refresh (token expired)
    A->>DB: Validate refresh token
    A-->>C: New accessToken
```

## Module System Design

Modules are fully dynamic — no code changes required for new tracking channels.

```
Module
├── name, slug, icon, color
├── fields[] (dynamic)
│   ├── name, slug, type, required, options
│   └── validation rules
├── isDefault (system modules)
└── isActive
```

Default modules (Instagram, WhatsApp) are seeded. Business owners create custom modules via admin dashboard.

## Analytics Engine

The analytics service computes growth metrics on-demand with optional Redis caching:

| Period | Calculation |
|--------|-------------|
| Daily | `(today - yesterday) / yesterday × 100` |
| Weekly | Compare current week avg vs previous week |
| Monthly | Compare current month vs previous month |
| Quarterly | 3-month rolling comparison |
| Yearly | Year-over-year comparison |

**Insights generated:**
- Fastest/slowest growing channel
- Best week/month
- Highest engagement day
- Consistency score (entry frequency)

## Reward System

| Action | Points |
|--------|--------|
| Daily entry submission | 10 |
| 7-day streak bonus | 50 |
| 30-day streak bonus | 200 |
| Same-day edit (accuracy) | 5 |

Champions: Weekly, Monthly, Quarterly based on total points.

## Scalability Considerations

| Feature | Design |
|---------|--------|
| Unlimited businesses | Horizontal API scaling behind load balancer |
| Branch management | `branches[]` on Business model |
| Feature toggles | `features` object on Subscription plan |
| White label | `branding` config per business |
| AI Analytics | Analytics service interface ready for ML pipeline |
| API Integrations | Module `source: 'api'` field for future auto-sync |

## Security

- bcrypt password hashing (12 rounds)
- JWT with short-lived access tokens
- Refresh token rotation
- Rate limiting on auth endpoints
- Helmet security headers
- CORS whitelist
- Input validation on all endpoints
- Audit logs for entry modifications

## Future Integration Points

```
┌──────────────────────────────────────────┐
│           Integration Hub (Future)        │
├──────────┬──────────┬──────────┬─────────┤
│ Instagram│ WhatsApp │   CRM    │   ERP   │
│   API    │ Business │  (HubSpot│ (SAP/   │
│          │   API    │  Salesforce)│ Oracle)│
└──────────┴──────────┴──────────┴─────────┘
```

Each integration will write to the same Entry collection via a sync service, preserving the module-based architecture.
