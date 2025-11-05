# API Usage (Base URL, Auth Header, Pagination, KPIs)

## Base
- Base URL: https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1
- Auth header (current): Authorization: Token <access_token>

## Pagination
- Query params: ?page=1&page_size=10
- Services return { results, count, next, previous } or raw arrays; hooks normalize pagination state

## CRUD Endpoints (high-level)
- Sales Reps: /sales-reps/
- Customers: /customers/ (+ /customers-nested/)
- Products: /products/ (+ /products-nested/)
- Interactions: /interactions/ (+ /interactions-nested/)
- Invoices: /invoices/ (+ /invoices-nested/)
- Payments: /payments/ (+ /payments-nested/)

## KPI Rules (no mock data)
- Use API count for totals (hooks query count via page_size=1 where applicable)
- Sales Reps: totals, active, roles via filtered count queries
- Customers/Products/Interactions/Invoices: status/type counts via filtered API queries; totals from count; values from current page when multi-currency to avoid mixing symbols
- Payments: totals aggregated per currency from current page; counts from paymentService.getCounts when needed

## Errors
- On 401: apiClient clears token and emits unauthorized (AuthContext signs out)
- Provide clear error messages from errorHandler; retry selectively
