# Specification

## Summary
**Goal:** Fix the admin invite status so redeemed invite codes reliably change from “Unused” to “Used” (including usage metadata) and the UI reflects the updated status without requiring a hard reload.

**Planned changes:**
- Fix backend invite redemption to consistently mark the invite as used (`used=true`) and set `usedAt` and `usedBy` when `redeemInviteCode` succeeds, ensuring admin listing reads from the same updated source of truth.
- Update Admin Invite Management page to use the backend API fields that include per-invite usage status (`used/usedAt/usedBy/deactivated`) and render “Used” vs “Unused” correctly.
- After successful redemption in the InviteGate flow, invalidate/refetch the admin invite list React Query cache so an admin sees updated invite usage without a full page reload (keeping existing accessState/currentUserProfile invalidations).

**User-visible outcome:** When an invite link/code is redeemed, admins will see the invite status switch to “Used” (with usage details) on the Admin Invite Management page after refresh/auto-refresh or query refetch, without needing a hard reload.
