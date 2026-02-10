import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Phone, TheftReport, PhoneStatus, Notification, Statistics, AccessState, InviteCode, IMEIEvent, InviteCodeWithStatus } from '../backend';
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

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: accessState } = useGetAccessState();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!accessState?.isUser,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!accessState?.isUser && query.isFetched,
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

// PIN Management Queries
export function useHasPin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: accessState } = useGetAccessState();

  return useQuery<boolean>({
    queryKey: ['hasPin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasPin();
    },
    enabled: !!actor && !actorFetching && !!accessState?.isUser,
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

// Admin Invite Management (using existing backend methods)
export function useGenerateInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateInviteCode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inviteCodes'] });
      queryClient.invalidateQueries({ queryKey: ['inviteCodesWithStatus'] });
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
  const { data: accessState } = useGetAccessState();

  return useQuery<InviteCode[]>({
    queryKey: ['inviteCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !actorFetching && !!accessState?.isAdmin,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

export function useGetInviteCodesWithStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: accessState } = useGetAccessState();

  return useQuery<InviteCodeWithStatus[]>({
    queryKey: ['inviteCodesWithStatus'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodesWithStatus();
    },
    enabled: !!actor && !actorFetching && !!accessState?.isAdmin,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

// Phone Queries
export function useGetUserPhones() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: accessState } = useGetAccessState();

  return useQuery<Phone[]>({
    queryKey: ['userPhones', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserPhones(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity && !!accessState?.isUser,
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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    mutationFn: async ({ imei, pin }: { imei: string; pin: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Call immediate release method
      return actor.releasePhone(imei, pin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhones'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Phone ownership released successfully');
    },
    onError: (error: unknown) => {
      // Use the safe error extraction utility
      const userMessage = extractReleaseErrorMessage(error);
      toast.error(userMessage);
    },
  });
}

// Theft Report Queries
export function useReportLostStolen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      imei, 
      location, 
      details, 
      isStolen 
    }: { 
      imei: string; 
      location: string; 
      details: string; 
      isStolen: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reportLostStolen(imei, location, details, isStolen);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhones'] });
      queryClient.invalidateQueries({ queryKey: ['theftReports'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    mutationFn: async ({ 
      imei, 
      finderInfo 
    }: { 
      imei: string; 
      finderInfo: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reportFound(imei, finderInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhones'] });
      queryClient.invalidateQueries({ queryKey: ['theftReports'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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

// IMEI Check Query
export function useCheckImei(imei: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PhoneStatus | null>({
    queryKey: ['checkImei', imei],
    queryFn: async () => {
      if (!actor || !imei) return null;
      return actor.checkImei(imei);
    },
    enabled: !!actor && !actorFetching && !!imei && imei.length >= 15,
  });
}

// IMEI History Query
export function useGetIMEIHistory(imei: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<IMEIEvent[]>({
    queryKey: ['imeiHistory', imei],
    queryFn: async () => {
      if (!actor || !imei) return [];
      return actor.getIMEIHistory(imei);
    },
    enabled: !!actor && !actorFetching && !!imei && imei.length >= 15,
  });
}

// Notification Queries
export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: accessState } = useGetAccessState();

  return useQuery<Notification[]>({
    queryKey: ['notifications', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getNotifications(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity && !!accessState?.isUser,
    refetchInterval: 10000,
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

// Statistics Queries
export function useGetStatistics() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Statistics>({
    queryKey: ['statistics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStatistics();
    },
    enabled: !!actor && !actorFetching,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

// Admin Check
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

// Invite Redemption
export function useRedeemInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.redeemInviteCode(inviteCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessState'] });
      queryClient.invalidateQueries({ queryKey: ['inviteCodesWithStatus'] });
      queryClient.invalidateQueries({ queryKey: ['inviteCodes'] });
      toast.success('Invite code redeemed successfully! You now have access.');
    },
    onError: (error: Error) => {
      const message = error.message.toLowerCase();
      if (message.includes('already been used')) {
        toast.error('This invite code has already been used');
      } else if (message.includes('deactivated')) {
        toast.error('This invite code has been deactivated');
      } else if (message.includes('invalid')) {
        toast.error('Invalid invite code');
      } else if (message.includes('already have user access')) {
        toast.error('You already have user access');
      } else {
        toast.error('Failed to redeem invite code: ' + error.message);
      }
    },
  });
}
