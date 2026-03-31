import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ActivationTokenInfo,
  IMEIEvent,
  InviteCode,
  InviteCodeWithStatus,
  Notification,
  Phone,
  RSVP,
  ReleaseOwnershipReason,
  Statistics,
  TheftReport,
  UserProfile,
} from "../backend";
import { useTranslation } from "../i18n/useTranslation";
import { extractReleaseErrorMessage } from "../utils/releaseOwnershipErrors";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// Access State Queries
export function useGetAccessState() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["accessState"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAccessState();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useHasUserAccess() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["hasUserAccess"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.hasUserAccess();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["isCurrentUserAdmin"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast.success(t("toast.profileSaved"));
    },
    onError: (error: any) => {
      console.error("Failed to save profile:", error);
      toast.error(t("toast.profileSaveFailed"));
    },
  });
}

// Phone Management Queries
export function useGetUserPhones() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Phone[]>({
    queryKey: ["userPhones", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserPhones(identity.getPrincipal());
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useAddPhone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      imei,
      brand,
      model,
      pin,
    }: { imei: string; brand: string; model: string; pin: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addPhone(imei, brand, model, pin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPhones"] });
      queryClient.invalidateQueries({ queryKey: ["hasPin"] });
      toast.success(t("toast.phoneRegistered"));
    },
    onError: (error: any) => {
      console.error("Failed to add phone:", error);
      toast.error(error.message || t("toast.phoneRegisterFailed"));
    },
  });
}

export function useReleasePhone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      imei,
      pin,
      reason,
    }: { imei: string; pin: string; reason: ReleaseOwnershipReason }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.releasePhone(imei, pin, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPhones"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      toast.success(t("toast.releaseSubmitted"));
    },
    onError: (error: any) => {
      console.error("Failed to release phone:", error);
      const userMessage = extractReleaseErrorMessage(error);
      toast.error(userMessage);
    },
  });
}

// PIN Management
export function useHasPin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["hasPin"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.hasPin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetOrChangePin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (newPin: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setOrChangePin(newPin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hasPin"] });
      toast.success(t("toast.pinSet"));
    },
    onError: (error: any) => {
      console.error("Failed to set PIN:", error);
      toast.error(error.message || t("toast.pinSetFailed"));
    },
  });
}

export function useValidatePin() {
  const { actor } = useActor();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.validatePin(pin);
    },
    onError: (error: any) => {
      console.error("PIN validation failed:", error);
      toast.error(t("toast.pinIncorrect"));
    },
  });
}

export function useClearPin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.clearPin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hasPin"] });
    },
  });
}

// Theft Reports
export function useReportLostStolen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      imei,
      location,
      details,
      isStolen,
    }: {
      imei: string;
      location: string;
      details: string;
      isStolen: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.reportLostStolen(imei, location, details, isStolen);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPhones"] });
      queryClient.invalidateQueries({ queryKey: ["theftReports"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      toast.success(t("toast.reportSubmitted"));
    },
    onError: (error: any) => {
      console.error("Failed to report:", error);
      toast.error(error.message || t("toast.reportFailed"));
    },
  });
}

export function useReportFound() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      imei,
      finderInfo,
    }: { imei: string; finderInfo: string | null }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.reportFound(imei, finderInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPhones"] });
      queryClient.invalidateQueries({ queryKey: ["theftReports"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      toast.success(t("toast.foundReportSubmitted"));
    },
    onError: (error: any) => {
      console.error("Failed to report found:", error);
      toast.error(error.message || t("toast.reportFailed"));
    },
  });
}

export function useGetAllTheftReports() {
  const { actor, isFetching } = useActor();

  return useQuery<TheftReport[]>({
    queryKey: ["theftReports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTheftReports();
    },
    enabled: !!actor && !isFetching,
  });
}

// IMEI Check
export function useCheckImei(imei: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["checkImei", imei],
    queryFn: async () => {
      if (!actor) return null;
      return actor.checkImei(imei);
    },
    enabled: !!actor && !isFetching && imei.length >= 15,
  });
}

export function useGetIMEIHistory(imei: string) {
  const { actor, isFetching } = useActor();

  return useQuery<IMEIEvent[]>({
    queryKey: ["imeiHistory", imei],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getIMEIHistory(imei);
    },
    enabled: !!actor && !isFetching && imei.length >= 15,
  });
}

// Statistics
export function useGetStatistics() {
  const { actor, isFetching } = useActor();

  return useQuery<Statistics>({
    queryKey: ["statistics"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getStatistics();
    },
    enabled: !!actor && !isFetching,
  });
}

// Notifications
export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Notification[]>({
    queryKey: ["notifications", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getNotifications(identity.getPrincipal());
    },
    enabled: !!actor && !!identity && !isFetching,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      console.error("Failed to mark notification:", error);
      toast.error(t("toast.notificationMarkFailed"));
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(t("toast.allNotificationsRead"));
    },
    onError: (error: any) => {
      console.error("Failed to mark notifications:", error);
      toast.error(t("toast.notificationsMarkFailed"));
    },
  });
}

// Invite Codes (Admin)
export function useGenerateInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.generateInviteCode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inviteCodes"] });
      queryClient.invalidateQueries({ queryKey: ["inviteCodesWithStatus"] });
      toast.success(t("toast.inviteGenerated"));
    },
    onError: (error: any) => {
      console.error("Failed to generate invite:", error);
      toast.error(error.message || t("toast.inviteGenerateFailed"));
    },
  });
}

export function useGetInviteCodes() {
  const { actor, isFetching } = useActor();

  return useQuery<InviteCode[]>({
    queryKey: ["inviteCodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInviteCodesWithStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<InviteCodeWithStatus[]>({
    queryKey: ["inviteCodesWithStatus"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodesWithStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRedeemInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.redeemInviteCode(inviteCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessState"] });
      queryClient.invalidateQueries({ queryKey: ["hasUserAccess"] });
      queryClient.invalidateQueries({ queryKey: ["isCurrentUserAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["inviteCodesWithStatus"] });
    },
  });
}

export function useDeactivateInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deactivateInviteCode(inviteCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inviteCodesWithStatus"] });
    },
  });
}

// RSVPs
export function useSubmitRSVP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      attending,
      inviteCode,
    }: { name: string; attending: boolean; inviteCode: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitRSVP(name, attending, inviteCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rsvps"] });
    },
  });
}

export function useGetAllRSVPs() {
  const { actor, isFetching } = useActor();

  return useQuery<RSVP[]>({
    queryKey: ["rsvps"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRSVPs();
    },
    enabled: !!actor && !isFetching,
  });
}

// Activation Token Management
export function useGenerateActivationToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (targetUser: string) => {
      if (!actor) throw new Error("Actor not available");
      const principal = Principal.fromText(targetUser);
      return actor.generateActivationToken(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activationTokenHistory"] });
      toast.success(t("toast.tokenGenerated"));
    },
    onError: (error: any) => {
      console.error("Failed to generate activation token:", error);
      toast.error(error.message || t("toast.tokenGenerateFailed"));
    },
  });
}

export function useRedeemActivationToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.redeemActivationToken(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessState"] });
      queryClient.invalidateQueries({ queryKey: ["hasUserAccess"] });
      queryClient.invalidateQueries({ queryKey: ["isCurrentUserAdmin"] });
      toast.success(t("toast.tokenRedeemed"));
    },
    onError: (error: any) => {
      console.error("Failed to redeem activation token:", error);
      toast.error(error.message || t("toast.tokenRedeemFailed"));
    },
  });
}

export function useGetActivationTokenHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<ActivationTokenInfo[]>({
    queryKey: ["activationTokenHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivationTokenHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCheckUserActivationStatus() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["userActivationStatus"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.checkUserActivationStatus();
    },
    enabled: !!actor && !isFetching,
  });
}
