# API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require `Authorization: Bearer <accessToken>` header.

### POST /auth/register

Register a new business owner and create workspace.

**Body:**
```json
{
  "email": "owner@business.com",
  "password": "SecurePass@123",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "Fitness Pro Gym",
  "businessType": "gym",
  "contactNumber": "+1234567890",
  "timezone": "America/New_York"
}
```

**Response:** `201` — `{ user, business, accessToken, refreshToken }`

### POST /auth/login

**Body:** `{ "email", "password" }`

**Response:** `200` — `{ user, business, accessToken, refreshToken }`

### POST /auth/refresh

**Body:** `{ "refreshToken" }`

**Response:** `200` — `{ accessToken, refreshToken }`

### POST /auth/forgot-password

**Body:** `{ "email" }`

**Response:** `200` — `{ message: "Reset email sent" }`

### POST /auth/reset-password

**Body:** `{ "token", "password" }`

**Response:** `200` — `{ message: "Password reset successful" }`

### POST /auth/logout

**Body:** `{ "refreshToken" }`

**Response:** `200` — `{ message: "Logged out" }`

---

## Users

### GET /users/me

Get current user profile.

**Roles:** All

### PUT /users/me

Update profile.

**Body:** `{ firstName?, lastName?, phone?, avatar?, fcmToken? }`

### GET /users

List staff members.

**Roles:** business_owner, super_admin

**Query:** `?page=1&limit=20&search=&isActive=true`

### POST /users

Add staff member.

**Roles:** business_owner

**Body:**
```json
{
  "email": "staff@business.com",
  "password": "Staff@123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "staff"
}
```

### PUT /users/:id

Update staff member.

**Roles:** business_owner

### DELETE /users/:id

Deactivate staff member.

**Roles:** business_owner

---

## Businesses

### GET /businesses/me

Get current business profile.

**Roles:** business_owner, staff

### PUT /businesses/me

Update business profile.

**Roles:** business_owner

**Body:** `{ name?, type?, logo?, address?, contactNumber?, timezone?, branding?, settings? }`

### GET /businesses

List all businesses (Super Admin).

**Roles:** super_admin

**Query:** `?page=1&limit=20&search=`

### GET /businesses/:id

Get business by ID.

**Roles:** super_admin

---

## Modules

### GET /modules

List all modules for business.

**Query:** `?isActive=true`

### GET /modules/:id

Get module details.

### POST /modules

Create custom module.

**Roles:** business_owner

**Body:**
```json
{
  "name": "YouTube",
  "description": "Track YouTube channel metrics",
  "icon": "youtube",
  "color": "#FF0000",
  "fields": [
    { "name": "Subscribers", "slug": "subscribers", "type": "number", "required": true, "order": 1 },
    { "name": "Views", "slug": "views", "type": "number", "required": true, "order": 2 }
  ]
}
```

### PUT /modules/:id

Update module.

**Roles:** business_owner

### DELETE /modules/:id

Deactivate module.

**Roles:** business_owner

---

## Entries

### GET /entries

List entries.

**Query:** `?moduleId=&userId=&startDate=&endDate=&page=1&limit=20`

### GET /entries/:id

Get entry details.

### POST /entries

Submit daily entry.

**Roles:** staff, business_owner

**Body:**
```json
{
  "moduleId": "module_id",
  "entryDate": "2026-06-15",
  "values": [
    { "fieldSlug": "followers", "value": 1500 },
    { "fieldSlug": "accounts_reached", "value": 5000 }
  ],
  "notes": "Good engagement today"
}
```

### PUT /entries/:id

Edit same-day entry.

**Roles:** staff (own entries), business_owner

### GET /entries/history/me

Get own submission history.

**Roles:** staff

---

## Analytics

### GET /analytics/dashboard

Dashboard overview KPIs.

**Response:**
```json
{
  "totalModules": 5,
  "totalStaff": 12,
  "totalEntries": 340,
  "bestPerformingModule": { "name": "Instagram", "growth": 15.2 },
  "worstPerformingModule": { "name": "WhatsApp", "growth": -2.1 }
}
```

### GET /analytics/growth

Growth metrics for a module.

**Query:** `?moduleId=&fieldSlug=followers&period=daily|weekly|monthly|quarterly|yearly&startDate=&endDate=`

### GET /analytics/insights

Advanced insights.

**Response:**
```json
{
  "fastestGrowingChannel": { "module": "Instagram", "growth": 22.5 },
  "slowestGrowingChannel": { "module": "WhatsApp", "growth": 1.2 },
  "bestWeek": { "week": "2026-W23", "growth": 18.0 },
  "bestMonth": { "month": "2026-05", "growth": 25.0 },
  "highestEngagementDay": { "date": "2026-06-10", "value": 8500 },
  "consistencyScore": 87.5
}
```

### GET /analytics/charts/:moduleId

Chart data for a module.

**Query:** `?fieldSlug=followers&chartType=line|bar|area&period=monthly&months=6`

---

## Rewards

### GET /rewards/leaderboard

Staff leaderboard.

**Query:** `?period=weekly|monthly|quarterly|all`

**Response:**
```json
{
  "leaderboard": [
    { "rank": 1, "userId": "...", "name": "Jane Smith", "points": 450, "streak": 15 }
  ]
}
```

### GET /rewards/me

Get own rewards and points.

**Roles:** staff

---

## Reports

### POST /reports/generate

Generate report.

**Roles:** business_owner

**Body:**
```json
{
  "type": "monthly",
  "format": "pdf",
  "period": { "start": "2026-05-01", "end": "2026-05-31" },
  "includeCharts": true,
  "includeLeaderboard": true
}
```

### GET /reports

List generated reports.

### GET /reports/:id/download

Download report file.

---

## Notifications

### GET /notifications

List notifications.

**Query:** `?isRead=false&page=1&limit=20`

### PUT /notifications/:id/read

Mark notification as read.

### PUT /notifications/read-all

Mark all as read.

---

## Plans & Subscriptions (Super Admin)

### GET /plans

List available plans.

### POST /plans

Create plan.

**Roles:** super_admin

### GET /subscriptions

List subscriptions.

**Roles:** super_admin

### PUT /subscriptions/:businessId

Update business subscription.

**Roles:** super_admin

---

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Email is required" }]
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden (role/tenant) |
| 404 | Not found |
| 409 | Conflict (duplicate entry) |
| 429 | Rate limited |
| 500 | Server error |
