# Specification

## Summary
**Goal:** Prevent the “Release Phone Ownership” flow from crashing or showing raw JSON/code when an error occurs, and instead display clean, user-friendly English error messaging while keeping the dialog usable.

**Planned changes:**
- Update the release ownership UI to never render raw error objects/JSON/debug output; show a plain-English error message (e.g., toast/inline) instead.
- Harden the `useReleasePhone` error handling to safely convert any thrown/structured values into a readable string (no React runtime errors from rendering objects/arrays/bigints).
- Map known backend/agent error/trap strings to consistent English messages (invalid PIN, PIN not set, unauthorized owner, IMEI not found) while preserving the existing success behavior (English success toast + phones list refresh via query invalidation).

**User-visible outcome:** If releasing phone ownership fails, the user sees a clear English error message and can correct inputs and retry or cancel—without any raw JSON/code appearing and without the dialog breaking.
