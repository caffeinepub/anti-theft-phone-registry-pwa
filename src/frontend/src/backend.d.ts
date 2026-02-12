import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MonthlyReportStats {
    total: bigint;
    monthly: Array<bigint>;
}
export interface TheftReport {
    imei: string;
    reportedBy: Principal;
    timestamp: Time;
    details: string;
    location: string;
}
export type Time = bigint;
export interface Statistics {
    lostPhones: bigint;
    activePhones: bigint;
    theftReportStats: MonthlyReportStats;
    statusBreakdown: StatusBreakdown;
    totalPhones: bigint;
    stolenPhones: bigint;
}
export type ReleaseOwnershipReason = {
    __kind__: "other";
    other: string;
} | {
    __kind__: "sold";
    sold: null;
} | {
    __kind__: "givenToSomeone";
    givenToSomeone: null;
} | {
    __kind__: "replacedWithNewPhone";
    replacedWithNewPhone: null;
};
export interface Phone {
    status: PhoneStatus;
    model: string;
    owner: Principal;
    imei: string;
    brand: string;
}
export interface InviteCodeWithStatus {
    created: Time;
    code: string;
    usedAt?: Time;
    usedBy?: Principal;
    deactivated: boolean;
    used: boolean;
    paymentNote?: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface AccessState {
    requiresInvite: boolean;
    isUser: boolean;
    isAdmin: boolean;
}
export interface Notification {
    id: bigint;
    title: string;
    notifType: NotificationType;
    user: Principal;
    isRead: boolean;
    message: string;
    timestamp: bigint;
    relatedIMEI?: string;
}
export interface StatusBreakdown {
    stolen: bigint;
    total: bigint;
    active: bigint;
    lost: bigint;
}
export interface IMEIEvent {
    timestamp: Time;
    details: string;
    eventType: EventType;
}
export interface UserProfile {
    city: string;
    email: string;
}
export enum EventType {
    reRegistered = "reRegistered",
    stolenReported = "stolenReported",
    lostReported = "lostReported",
    ownershipReleased = "ownershipReleased",
    ownershipTransferred = "ownershipTransferred",
    foundReported = "foundReported",
    registered = "registered"
}
export enum NotificationType {
    warning = "warning",
    info = "info",
    success = "success"
}
export enum PhoneStatus {
    stolen = "stolen",
    active = "active",
    lost = "lost"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPhone(imei: string, brand: string, model: string, pin: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkImei(imei: string): Promise<PhoneStatus | null>;
    clearPin(): Promise<void>;
    deactivateInviteCode(inviteCode: string): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAccessState(): Promise<AccessState>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllTheftReports(): Promise<Array<TheftReport>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getIMEIHistory(imei: string): Promise<Array<IMEIEvent>>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getInviteCodesWithStatus(): Promise<Array<InviteCodeWithStatus>>;
    getNotifications(user: Principal): Promise<Array<Notification>>;
    getStatistics(): Promise<Statistics>;
    getUserPhones(user: Principal): Promise<Array<Phone>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasPin(): Promise<boolean>;
    hasUserAccess(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    markAllNotificationsAsRead(): Promise<void>;
    markNotificationAsRead(notificationId: bigint): Promise<void>;
    redeemInviteCode(inviteCode: string): Promise<void>;
    registerProfile(email: string, city: string): Promise<void>;
    releasePhone(imei: string, pin: string, reason: ReleaseOwnershipReason): Promise<void>;
    reportFound(imei: string, finderInfo: string | null): Promise<void>;
    reportLostStolen(imei: string, location: string, details: string, isStolen: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setOrChangePin(newPin: string): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    transferOwnership(imei: string, newOwner: Principal): Promise<void>;
    validatePin(pin: string): Promise<void>;
}
