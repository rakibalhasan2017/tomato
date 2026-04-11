# Geolocation Feature Implementation Guide

This document explains what was implemented for browser geolocation in this project, why it was implemented this way, and how data moves from frontend to backend.

## Goal

Before a user can continue with the food-ordering action, the app must try to get the user location using the Browser Geolocation API.

The current implementation includes:

- Location capture attempt right after login callback.
- Location capture retry when user clicks Order Food.
- Backend persistence of location permission state and coordinates.
- Location data added to user profile response.

## Files Involved

### Frontend

- frontend/src/services/geolocation.ts
- frontend/src/services/api.ts
- frontend/src/context/auth-context.ts
- frontend/src/pages/OAuthCallback.tsx
- frontend/src/pages/Dashboard.tsx

### Backend

- services/auth-service/src/model/user.ts
- services/auth-service/src/controller/authcontroller.ts
- services/auth-service/src/routes/authroute.ts

## Backend Data Model

File: services/auth-service/src/model/user.ts

A new optional field was added to the user document:

```ts
currentLocation?: {
  point?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  accuracyMeters?: number;
  capturedAt: Date;
  source: 'browser';
  permission: 'granted' | 'denied' | 'unavailable';
};
```

A geospatial index is also defined:

```ts
UserSchema.index({ 'currentLocation.point': '2dsphere' });
```

Why this index matters:

- It prepares the data for future nearby-restaurant queries.
- It is standard for GeoJSON Point queries like $near.

## Backend API Endpoints

File: services/auth-service/src/routes/authroute.ts

Protected routes added:

- PUT /api/auth/location
- GET /api/auth/location

These routes require verifyJWT, so location is always tied to an authenticated user.

## Backend Controller Logic

File: services/auth-service/src/controller/authcontroller.ts

### 1) updateCurrentLocation

Input body shape:

```ts
{
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  capturedAt?: string;
  permission: 'granted' | 'denied' | 'unavailable';
}
```

Rules:

- If permission is denied or unavailable:
  - Save only permission metadata (capturedAt, source, permission).
  - Do not require coordinates.
- If permission is granted:
  - latitude and longitude are required.
  - Latitude must be in [-90, 90].
  - Longitude must be in [-180, 180].
  - accuracyMeters must be >= 0 if provided.
  - capturedAt must be a valid date if provided.

Success responses:

- 200 with updated currentLocation payload.

Error responses:

- 400 for invalid inputs.
- 401 if JWT user context is missing.
- 404 if user is not found.
- 500 for server errors.

### 2) getCurrentLocation

- Reads user by JWT email and returns currentLocation.
- Returns currentLocation: null when no location has been stored yet.

### 3) myprofile enhancement

myprofile now includes currentLocation so frontend can hydrate this state with profile fetch.

## Frontend Geolocation Wrapper

File: frontend/src/services/geolocation.ts

The wrapper getBrowserLocation(timeoutMs = 10000) standardizes browser geolocation behavior.

Success shape:

```ts
{
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  capturedAt: string; // ISO timestamp
}
```

Error shape:

```ts
{
  code: 'permission_denied' | 'position_unavailable' | 'timeout' | 'unsupported' | 'unknown';
  message: string;
}
```

Why this wrapper is useful:

- Keeps browser API details out of page components.
- Converts low-level browser errors to app-friendly error codes/messages.

## Frontend API Client Additions

File: frontend/src/services/api.ts

Added:

- updateCurrentLocation(token, payload)
- getCurrentLocation(token)
- CurrentLocation type

Both methods call /api/auth/location and use Bearer token auth.

## Frontend Auth Store Changes

File: frontend/src/context/auth-context.ts

Added to store:

- currentLocation: CurrentLocation | null
- setCurrentLocation(location)

Persisted in localStorage with token and user for smoother reload behavior.

## Frontend Flow 1: Login Callback

File: frontend/src/pages/OAuthCallback.tsx

Sequence:

1. OAuth token is read from query params.
2. getMyProfile(token) fetches user profile.
3. login(token, userProfile) stores auth state.
4. App tries getBrowserLocation().
5. If geolocation succeeds:
   - PUT /api/auth/location with permission=granted and coordinates.
   - setCurrentLocation(response.currentLocation).
6. If geolocation fails:
   - PUT /api/auth/location with permission=denied or unavailable.
   - setCurrentLocation(response.currentLocation) if persistence succeeds.
   - If persistence fails, login still continues (important reliability behavior).
7. Navigate to /dashboard or /roleadd.

Important reliability design:

- Location failure does not block login.
- Ordering flow enforces location later when needed.

## Frontend Flow 2: Order Food Action

File: frontend/src/pages/Dashboard.tsx

Sequence on Order Food click:

1. If no token, show auth error.
2. If currentLocation is granted and fresh, navigate directly.
   - Freshness window uses LOCATION_STALE_MS = 30 minutes.
3. If location is missing/stale:
   - Trigger getBrowserLocation().
4. On success:
   - PUT /api/auth/location with granted payload.
   - Update store with setCurrentLocation(...).
   - Navigate to /track-order (current placeholder flow).
5. On failure:
   - Persist permission state (denied/unavailable) via API.
   - Clear local currentLocation.
   - Show actionable error message in dashboard.

## Request/Response Examples

### A) Granted location update

Request:

```http
PUT /api/auth/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 23.8103,
  "longitude": 90.4125,
  "accuracyMeters": 18,
  "capturedAt": "2026-04-11T09:20:00.000Z",
  "permission": "granted"
}
```

Response:

```json
{
  "message": "Current location updated",
  "currentLocation": {
    "point": {
      "type": "Point",
      "coordinates": [90.4125, 23.8103]
    },
    "accuracyMeters": 18,
    "capturedAt": "2026-04-11T09:20:00.000Z",
    "source": "browser",
    "permission": "granted"
  }
}
```

### B) Permission denied update

Request:

```http
PUT /api/auth/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "permission": "denied"
}
```

Response:

```json
{
  "message": "Location permission state stored",
  "currentLocation": {
    "capturedAt": "2026-04-11T09:25:11.120Z",
    "source": "browser",
    "permission": "denied"
  }
}
```

## End-to-End Sequence (Frontend to Backend)

1. User authenticates via Google.
2. Frontend callback page fetches profile.
3. Frontend attempts browser geolocation.
4. Frontend sends location state to backend via PUT /api/auth/location.
5. Backend validates and stores location data in MongoDB user document.
6. Frontend stores currentLocation in Zustand state.
7. User clicks Order Food.
8. Dashboard checks freshness and permission.
9. If stale/missing, dashboard re-attempts geolocation and persists again.
10. Only then user is allowed to continue.

## Why This Design Is Good For Learning

- It separates concerns clearly:
  - Browser geolocation logic in one service module.
  - API contract in one service module.
  - State in one context store.
  - Persistence and validation in backend controller.
- It includes real-world error handling:
  - Permission denied.
  - Device/location unavailable.
  - Timeout.
  - Unsupported browser.
- It demonstrates progressive enforcement:
  - Login remains smooth.
  - Action requiring location enforces strict gate.

## Current Limitation

The Order Food button currently routes to /track-order, which is still a placeholder page. The location gate is implemented, but full browse/cart/checkout flow is not implemented yet.

## Suggested Next Learning Steps

1. Add a dedicated /browse-restaurants route and move location gate there.
2. Add GET /api/auth/location usage on app startup to rehydrate location state from server as source of truth.
3. Add backend tests for coordinate validation and permission-only updates.
4. Add frontend tests for geolocation error branches.
5. Add UI prompt to open browser settings when permission is denied.
