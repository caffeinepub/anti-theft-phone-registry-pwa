import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Phone, TheftReport, PhoneStatus, Notification, Statistics, AccessState, InviteCode, IMEIEvent, InviteCodeWithStatus, ReleaseOwnershipReason, UserRole } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';
import i18n from '../i18n';
import { extractReleaseErrorMessage } from '../utils/releaseOwnershipErrors';

// Access State Query
export function useGetAccessState() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<AccessState>({
    queryKey: ['accessState', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAccessState();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

// User Access Query (for activation status)
export function useHasUserAccess() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['hasUserAccess', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasUserAccess();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: hasAccess } = useHasUserAccess();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && hasAccess === true,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && hasAccess === true && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success(i18n.t('toast.profileSaved'));
    },
    onError: (error: Error) => {
      toast.error(i18n.t('toast.profileSaveFailed') + ': ' + error.message);
    },
  });
}

// Admin User Activation
export function useActivateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      // Import UserRole enum and use it correctly
      const { UserRole } = await import('../backend');
      return actor.assignCallerUserRole(userPrincipal, UserRole.user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasUserAccess'] });
      toast.success('User activated successfully! They can now register phones.');
    },
    onError: (error: Error) => {
      const message = error.message.toLowerCase();
      if (message.includes('unauthorized') || message.includes('admin')) {
        toast.error('Only admins can activate users');
      } else {
        toast.error('Failed to activate user: ' + error.message);
      }
    },
  });
}

// PIN Management Queries
export function useHasPin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: hasAccess } = useHasUserAccess();

  return useQuery<boolean>({
    queryKey: ['hasPin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasPin();
    },
    enabled: !!actor && !actorFetching && hasAccess === true,
  });
}

export function useSetOrChangePin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ newPin, currentPin, onSuccessCallback }: { newPin: string; currentPin?: string; onSuccessCallback?: () => void }) => {
      if (!actor) throw new Error('Actor not available');
      
      // If currentPin is provided, validate it first
      if (currentPin) {
        await actor.validatePin(currentPin);
      }
      
      await actor.setOrChangePin(newPin);
      
      // Call the optional callback after successful PIN set
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasPin'] });
      toast.success(i18n.t('toast.pinSet'));
    },
    onError: (error: Error) => {
      const message = error.message.toLowerCase();
      if (message.includes('invalid pin')) {
        toast.error(i18n.t('toast.pinIncorrect'));
      } else {
        toast.error(i18n.t('toast.pinSetFailed') + ': ' + error.message);
      }
    },
  });
}

// Admin Invite Management (keeping for backward compatibility, but not used in new flow)
export function useGenerateInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateInviteCode();
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['inviteCodesWithStatus'] });
      await queryClient.refetchQueries({ queryKey: ['inviteCodes'] });
      toast.success(i18n.t('toast.inviteGenerated'));
    },
    onError: (error: Error) => {
      const message = error.message.toLowerCase();
      if (message.includes('unauthorized') || message.includes('admin')) {
        toast.error(i18n.t('toast.adminOnly'));
      } else {
        toast.error(i18n.t('toast.inviteGenerateFailed') + ': ' + error.message);
      }
    },
  });
}

export function useGetInviteCodes() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin } = useIsCurrentUserAdmin();

  return useQuery<InviteCode[]>({
    queryKey: ['inviteCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !actorFetching && !!isAdmin,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useGetInviteCodesWithStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin } = useIsCurrentUserAdmin();

  return useQuery<InviteCodeWithStatus[]>({
    queryKey: ['inviteCodesWithStatus'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodesWithStatus();
    },
    enabled: !!actor && !actorFetching && !!isAdmin,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

// Phone Management Queries
export function useGetUserPhones() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: hasAccess } = useHasUserAccess();

  return useQuery<Phone[]>({
    queryKey: ['userPhones', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserPhones(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity && hasAccess === true,
  });
}

export function useAddPhone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imei, brand, model, pin }: { imei: string; brand: string; model: string; pin: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPhone(imei, brand, model, pin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhones'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['hasPin'] });
      toast.success(i18n.t('toast.phoneRegistered'));
    },
    onError: (error: Error) => {
      toast.error(i18n.t('toast.phoneRegisterFailed') + ': ' + error.message);
    },
  });
}

export function useReleasePhone() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imei, pin, reason }: { imei: string; pin: string; reason: ReleaseOwnershipReason }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.releasePhone(imei, pin, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhones'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success(i18n.t('toast.releaseSubmitted'));
    },
    onError: (error: Error) => {
      const friendlyMessage = extractReleaseErrorMessage(error);
      toast.error(friendlyMessage);
    },
  });
}

// Theft Report Queries
export function useReportLostStolen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imei, location, details, isStolen }: { imei: string; location: string; details: string; isStolen: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reportLostStolen(imei, location, details, isStolen);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhones'] });
      queryClient.invalidateQueries({ queryKey: ['theftReports'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success(i18n.t('toast.reportSubmitted'));
    },
    onError: (error: Error) => {
      toast.error(i18n.t('toast.reportFailed') + ': ' + error.message);
    },
  });
}

export function useReportFound() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imei, finderInfo }: { imei: string; finderInfo: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reportFound(imei, finderInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhones'] });
      queryClient.invalidateQueries({ queryKey: ['theftReports'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success(i18n.t('toast.foundReportSubmitted'));
    },
    onError: (error: Error) => {
      toast.error(i18n.t('toast.reportFailed') + ': ' + error.message);
    },
  });
}

export function useGetAllTheftReports() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TheftReport[]>({
    queryKey: ['theftReports'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTheftReports();
    },
    enabled: !!actor && !actorFetching,
  });
}

// IMEI Check Queries
export function useCheckImei(imei: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PhoneStatus | null>({
    queryKey: ['imeiCheck', imei],
    queryFn: async () => {
      if (!actor || !imei) return null;
      return actor.checkImei(imei);
    },
    enabled: !!actor && !actorFetching && !!imei && imei.length >= 15,
  });
}

export function useGetIMEIHistory(imei: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<IMEIEvent[]>({
    queryKey: ['imeiHistory', imei],
    queryFn: async () => {
      if (!actor || !imei) return [];
      return actor.getIMEIHistory(imei);
    },
    enabled: !!actor && !actorFetching && !!imei && !!identity,
  });
}

// Statistics Query
export function useGetStatistics() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Statistics>({
    queryKey: ['statistics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStatistics();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Notifications Queries
export function useGetNotifications(user: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getNotifications(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast.error(i18n.t('toast.notificationMarkFailed') + ': ' + error.message);
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(i18n.t('toast.allNotificationsRead'));
    },
    onError: (error: Error) => {
      toast.error(i18n.t('toast.notificationsMarkFailed') + ': ' + error.message);
    },
  });
}

// Admin Check Query
export function useIsCurrentUserAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
