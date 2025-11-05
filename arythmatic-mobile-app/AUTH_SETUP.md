# Authentication Setup (Test, MSAL, ROPG)

## Current (Test Provider)
- Provider: TEST (see constants/authConfig.js)
- Token: GLOBAL_ACCESS_TOKEN in services/authProvider/testProvider.js (dev-only)
- Storage: AsyncStorage → STORAGE_KEYS.AUTH_TOKEN (+ REFRESH_TOKEN when applicable)
- Header: Authorization: Token <access_token>
- Flow: Login -> store token -> apiClient attaches on every request; 401 emits unauthorized and forces sign-out.

## MSAL (Interactive) – What we need
- Tenant ID, Client ID, Authority (https://login.microsoftonline.com/{tenant})
- Scopes: your API resource (e.g., api://{api-client-id}/.default)
- Redirect URIs: iOS and Android broker URIs (msauth…)
- Backend acceptance: confirm Authorization: Bearer <jwt>
- Configure AUTH_PROVIDER=msal and MSAL_* values in constants/authConfig.js
- msalProvider handles acquireTokenInteractive/silent -> stores token -> apiClient sends Authorization on calls

## ROPG (Resource Owner Password Grant) – What we need
- Token endpoint: https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
- Client: client_id (and client_secret if confidential)
- Scopes: offline_access + your API scopes (api.read, api.write)
- App Registration: enable public client & allow ROPC; ensure CA/MFA policy allows these accounts
- Parameters (x-www-form-urlencoded): grant_type=password, client_id, scope, username, password, [client_secret]
- Refresh: grant_type=refresh_token (rotate tokens; always store the latest)
- Header Scheme: confirm Bearer vs Token for downstream API
- Storage: AsyncStorage (consider encrypted storage in prod)

## Token storage & usage
- Stored keys: STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER_DATA
- apiClient.getToken() caches in memory and falls back to AsyncStorage
- apiClient.request() adds Authorization header and handles 401 by clearing token and emitting an unauthorized event (AuthContext signs out)

## App logic (recommended)
- Boot: load tokens; validate or try silent refresh; otherwise show Login
- Login: request token; store access/refresh; call /auth/me (or Microsoft Graph) to populate user; proceed to app
- API Calls: attach Authorization; on 401 → single refresh attempt; logout if refresh fails
- Logout: revoke if supported; clear tokens; navigate to Login

## TTLs & security (recommended)
- access_token TTL ~ 3600s; refresh_token TTL ~ 30d
- Store minimal claims; do not log tokens; use HTTPS only
- Migrate to MSAL interactive when MFA is enforced
