# Specification

## Summary
**Goal:** Fix the blank screen/crash by properly initializing TanStack React Router and ensuring `MainLayout` (and its `Outlet`) is rendered within router context.

**Planned changes:**
- Add a TanStack React Router module with a route tree covering all bottom-tab paths (`/`, `/phones`, `/report-lost`, `/check`, `/notifications`, `/statistics`, `/about`, `/profile`, `/admin`) plus a simple Not Found fallback route.
- Update `frontend/src/main.tsx` to wrap the app in `RouterProvider` using the created router instance.
- Refactor the authenticated/activated “allowed into the app” render path so routed content is rendered via the router (mount `MainLayout` as part of a route instead of rendering it directly outside router control).

**User-visible outcome:** The app no longer shows a blank screen or crashes; bottom navigation links work and each tab route renders the correct page, with unknown URLs showing a Not Found page.
