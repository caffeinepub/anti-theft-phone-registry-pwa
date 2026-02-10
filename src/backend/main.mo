import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import Notification "lib/Notification";
import Statistics "lib/Statistics";
import Random "mo:core/Random";
import InviteLinksModule "invite-links/invite-links-module";



actor {
  type PhoneStatus = { #active; #lost; #stolen };
  public type Notification = Notification.Notification;

  type UserProfile = {
    email : Text;
    city : Text;
  };

  type Phone = {
    imei : Text;
    brand : Text;
    model : Text;
    owner : Principal;
    status : PhoneStatus;
  };

  type TheftReport = {
    imei : Text;
    timestamp : Time.Time;
    location : Text;
    reportedBy : Principal;
    details : Text;
  };

  type FoundReport = {
    imei : Text;
    finderInfo : ?Text;
    timestamp : Time.Time;
    reportedBy : Principal;
  };

  type Statistics = Statistics.Statistics;

  public type AccessState = {
    isAdmin : Bool;
    isUser : Bool;
    requiresInvite : Bool;
  };

  type InviteCodeWithStatus = {
    code : Text;
    created : Time.Time;
    used : Bool;
    usedAt : ?Time.Time;
    usedBy : ?Principal;
    paymentNote : ?Text;
    deactivated : Bool;
  };

  type ReleaseRequest = {
    id : Nat;
    owner : Principal;
    imei : Text;
    reason : Text;
    verified : Bool;
    timestamp : Time.Time;
  };

  module Phone {
    public func compare(phone1 : Phone, phone2 : Phone) : Order.Order {
      Text.compare(phone1.imei, phone2.imei);
    };
  };

  module TheftReport {
    public func compare(report1 : TheftReport, report2 : TheftReport) : Order.Order {
      Int.compare(report2.timestamp, report1.timestamp);
    };
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let phones = Map.empty<Text, Phone>();
  let theftReports = Map.empty<Text, TheftReport>();
  let foundReports = Map.empty<Text, FoundReport>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  let releaseRequests = Map.empty<Principal, List.List<ReleaseRequest>>();
  let invitesWithStatus = Map.empty<Text, InviteCodeWithStatus>();
  // PIN storage.
  let pins = Map.empty<Principal, Text>();
  let accessControlState = AccessControl.initState();
  var nextReleaseRequestId = 0;

  // Migrate state for Invite Links System
  let inviteLinksState = InviteLinksModule.initState();
  include MixinAuthorization(accessControlState);

  //---------------------------------
  // PIN Management
  //---------------------------------

  public shared ({ caller }) func setOrChangePin(newPin : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set or change PIN");
    };
    pins.add(caller, newPin);
  };

  public query ({ caller }) func hasPin() : async Bool {
    pins.containsKey(caller);
  };

  public shared ({ caller }) func validatePin(pin : Text) : async () {
    switch (pins.get(caller)) {
      case (?storedPin) {
        if (storedPin != pin) {
          Runtime.trap("Invalid PIN");
        };
      };
      case (null) {
        Runtime.trap("No PIN set for this user");
      };
    };
  };

  public shared ({ caller }) func clearPin() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can clear PIN");
    };
    if (not pins.containsKey(caller)) {
      Runtime.trap("No PIN to clear for this user");
    };
    pins.remove(caller);
  };

  //---------------------------------
  // IMEI History
  //---------------------------------

  public type IMEIEvent = {
    eventType : EventType;
    timestamp : Time.Time;
    details : Text;
  };

  public type EventType = {
    #registered;
    #lostReported;
    #stolenReported;
    #foundReported;
    #ownershipTransferred;
    #ownershipReleaseRequested;
    #ownershipRevoked;
    #reRegistered;
  };

  public query func getIMEIHistory(imei : Text) : async [IMEIEvent] {
    // Public function - no authorization required (for public "Check IMEI" page)
    let events : List.List<IMEIEvent> = List.empty<IMEIEvent>();

    // Check if phone exists and add registration event
    switch (phones.get(imei)) {
      case (?phone) {
        events.add({
          eventType = #registered;
          timestamp = Time.now();
          details = "Phone registered: " # phone.brand # " (" # phone.model # ")";
        });
      };
      case (null) {};
    };

    // Add theft/lost reports
    switch (theftReports.get(imei)) {
      case (?report) {
        let eventType = if (_isReportedAsStolen(imei)) { #stolenReported } else {
          #lostReported
        };
        events.add({
          eventType;
          timestamp = report.timestamp;
          details = report.details;
        });
      };
      case (null) {};
    };

    // Add found reports
    switch (foundReports.get(imei)) {
      case (?report) {
        events.add({
          eventType = #foundReported;
          timestamp = report.timestamp;
          details = "Phone found";
        });
      };
      case (null) {};
    };

    // Add ownership transfer and release events
    for (requests in releaseRequests.values()) {
      for (request in requests.values()) {
        if (request.imei == imei) {
          events.add({
            eventType = #ownershipReleaseRequested;
            timestamp = request.timestamp;
            details = "Request to release ownership";
          });
        };
      };
    };

    events.toArray();
  };

  func _isReportedAsStolen(imei : Text) : Bool {
    switch (phones.get(imei)) {
      case (?phone) { phone.status == #stolen };
      case (null) { false };
    };
  };

  //---------------------------------
  // General Access and Invite Codes
  //---------------------------------

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);

    // Store invite code with status tracking
    let inviteStatus : InviteCodeWithStatus = {
      code;
      created = Time.now();
      used = false;
      usedAt = null;
      usedBy = null;
      paymentNote = null;
      deactivated = false;
    };
    invitesWithStatus.add(code, inviteStatus);

    InviteLinksModule.generateInviteCode(inviteLinksState, code);
    code;
  };

  public shared ({ caller }) func redeemInviteCode(inviteCode : Text) : async () {
    // Check if caller is already a user
    if (AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("You already have user access");
    };

    // Verify invite code exists and is valid
    switch (invitesWithStatus.get(inviteCode)) {
      case (?invite) {
        if (invite.deactivated) {
          Runtime.trap("This invite code has been deactivated");
        };
        if (invite.used) {
          Runtime.trap("This invite code has already been used");
        };

        // Mark invite as used with timestamp and user
        let updatedInvite : InviteCodeWithStatus = {
          code = invite.code;
          created = invite.created;
          used = true;
          usedAt = ?Time.now();
          usedBy = ?caller;
          paymentNote = invite.paymentNote;
          deactivated = invite.deactivated;
        };
        invitesWithStatus.add(inviteCode, updatedInvite);

        // Grant user role to the caller
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
      case (null) {
        Runtime.trap("Invalid invite code");
      };
    };
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    // Authorization: Must be authenticated (at least guest level)
    // Guests can RSVP, but we verify the invite code exists
    switch (invitesWithStatus.get(inviteCode)) {
      case (?invite) {
        if (invite.deactivated) {
          Runtime.trap("This invite code has been deactivated");
        };
        InviteLinksModule.submitRSVP(inviteLinksState, name, attending, inviteCode);
      };
      case (null) {
        Runtime.trap("Invalid invite code");
      };
    };
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteLinksState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteLinksState);
  };

  public query ({ caller }) func getInviteCodesWithStatus() : async [InviteCodeWithStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes with status");
    };
    invitesWithStatus.values().toArray();
  };

  public shared ({ caller }) func deactivateInviteCode(inviteCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can deactivate invite codes");
    };

    switch (invitesWithStatus.get(inviteCode)) {
      case (?invite) {
        let updatedInvite : InviteCodeWithStatus = {
          code = invite.code;
          created = invite.created;
          used = invite.used;
          usedAt = invite.usedAt;
          usedBy = invite.usedBy;
          paymentNote = invite.paymentNote;
          deactivated = true;
        };
        invitesWithStatus.add(inviteCode, updatedInvite);
      };
      case (null) {
        Runtime.trap("Invite code not found");
      };
    };
  };

  //------------------------------
  // Access State Check (Safe API)
  //------------------------------

  public query ({ caller }) func getAccessState() : async AccessState {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    let requiresInvite = not isAdmin and not isUser;

    {
      isAdmin;
      isUser;
      requiresInvite;
    };
  };

  //------------------------------
  // User Profile Management
  //------------------------------

  public shared ({ caller }) func registerProfile(email : Text, city : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users with valid invite can register profiles");
    };
    userProfiles.add(
      caller,
      {
        email;
        city;
      },
    );
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  //------------------------------
  // Phone Registration
  //------------------------------

  public shared ({ caller }) func addPhone(imei : Text, brand : Text, model : Text, pin : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add phones");
    };

    // Enforce PIN requirement for new users during phone registration
    // New users must set a PIN during the IMEI registration flow
    if (not pins.containsKey(caller)) {
      // User doesn't have a PIN yet, so we set it now during registration
      if (pin.size() != 4) {
        Runtime.trap("PIN must be exactly 4 digits");
      };
      pins.add(caller, pin);
    };

    // Check if IMEI is already registered and active
    switch (phones.get(imei)) {
      case (?existingPhone) {
        if (existingPhone.owner != caller) {
          Runtime.trap("The HP (IMEI " # imei # ") is already registered to a different owner. Please request a release from the current owner.");
        } else {
          Runtime.trap("This HP is already registered to your account");
        };
      };
      case (null) {
        // IMEI not found or previously released, proceed with registration
        let phone : Phone = {
          imei;
          brand;
          model;
          owner = caller;
          status = #active;
        };
        phones.add(imei, phone);
        _sendNotification(caller, "HP berhasil didaftarkan", "HP dengan IMEI " # imei # " berhasil ditambahkan ke akun Anda. Pengingat: Mohon jaga HP Anda dengan baik.", #success, null);
      };
    };
  };

  public shared ({ caller }) func transferOwnership(imei : Text, newOwner : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Hanya pemilik HP yang dapat melakukan transfer kepemilikan.");
    };
    switch (phones.get(imei)) {
      case (?phone) {
        if (phone.owner != caller) {
          Runtime.trap("Unauthorized: Hanya pemilik HP yang dapat mentransfer kepemilikan.");
        };
        let updatedPhone : Phone = {
          imei = phone.imei;
          brand = phone.brand;
          model = phone.model;
          owner = newOwner;
          status = #active;
        };
        phones.add(imei, updatedPhone);
        _sendNotification(
          caller,
          "Kepemilikan HP Ditransfer",
          "Kepemilikan HP " # phone.brand # " (" # phone.model # ") dengan IMEI " # imei # " telah berhasil ditransfer ke pemilik baru.",
          #success,
          null,
        );
        _sendNotification(
          newOwner,
          "Anda Menerima Kepemilikan HP",
          "Anda telah menerima kepemilikan HP " # phone.brand # " (" # phone.model # ") dengan IMEI " # imei # " dari pemilik sebelumnya.",
          #info,
          ?imei,
        );
      };
      case (null) {
        Runtime.trap("HP tidak ditemukan. Pastikan IMEI yang dimasukkan benar.");
      };
    };
  };

  public shared ({ caller }) func releasePhone(imei : Text, pin : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to release phone");
    };

    // Explicitly check for PIN before releasing phone.
    // Legacy users without a PIN must set one before performing security actions
    switch (pins.get(caller)) {
      case (?storedPin) {
        if (storedPin != pin) {
          Runtime.trap("Invalid PIN");
        };
      };
      case (null) {
        Runtime.trap("You must set a 4-digit PIN before you can release a phone");
      };
    };

    switch (phones.get(imei)) {
      case (?phone) {
        if (phone.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can release this phone");
        };
        phones.remove(imei);
        _sendNotification(
          caller,
          "HP berhasil dirilis",
          "HP dengan IMEI " # imei # " berhasil dirilis dari akun Anda. Anda dapat mendaftarkan HP baru sekarang.",
          #success,
          null,
        );
      };
      case (null) {
        Runtime.trap("HP not found. Please check the IMEI.");
      };
    };
  };

  //--------------------------------
  // Phone Reporting
  //--------------------------------

  public shared ({ caller }) func reportLostStolen(imei : Text, location : Text, details : Text, isStolen : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Hanya pemilik HP yang dapat melaporkan HP mereka.");
    };
    switch (phones.get(imei)) {
      case (?phone) {
        if (phone.owner != caller) {
          Runtime.trap("Unauthorized: Hanya pemilik HP yang dapat melaporkan kehilangan atau pencurian HP.");
        };
        let updatedPhone : Phone = {
          imei = phone.imei;
          brand = phone.brand;
          model = phone.model;
          owner = caller;
          status = if (isStolen) { #stolen } else { #lost };
        };

        let report : TheftReport = {
          imei;
          timestamp = Time.now();
          location;
          reportedBy = caller;
          details;
        };

        phones.add(imei, updatedPhone);
        theftReports.add(imei, report);
        if (isStolen) {
          _sendNotification(
            caller,
            "HP Dilaporkan Dicuri",
            "HP " # phone.brand # " (" # phone.model # ") berhasil dilaporkan sebagai 'DICURI' di sistem kami. Data IMEI: " # imei,
            #warning,
            ?imei,
          );
        } else {
          _sendNotification(
            caller,
            "HP Dilaporkan Hilang",
            "HP " # phone.brand # " (" # phone.model # ") berhasil dilaporkan sebagai 'HILANG' di sistem kami. Data IMEI: " # imei,
            #warning,
            ?imei,
          );
        };
      };
      case (null) {
        Runtime.trap("HP tidak ditemukan. Pastikan IMEI yang dimasukkan benar.");
      };
    };
  };

  public shared ({ caller }) func reportFound(imei : Text, finderInfo : ?Text) : async () {
    // No authorization required - anyone can report finding a phone
    switch (phones.get(imei)) {
      case (?phone) {
        let foundReport : FoundReport = {
          imei;
          finderInfo;
          timestamp = Time.now();
          reportedBy = caller;
        };

        foundReports.add(imei, foundReport);

        if (phone.status == #lost or phone.status == #stolen) {
          let updatedPhone : Phone = {
            imei = phone.imei;
            brand = phone.brand;
            model = phone.model;
            owner = phone.owner;
            status = #active;
          };
          phones.add(imei, updatedPhone);

          _sendNotification(
            phone.owner,
            "HP Anda Ditemukan",
            "HP Anda dengan IMEI " # imei # " telah ditemukan dan dilaporkan di sistem kami. Silakan hubungi pihak pelapor untuk informasi lebih lanjut.",
            #success,
            ?imei,
          );
        };
      };
      case (null) {
        Runtime.trap("HP tidak ditemukan. Pastikan IMEI yang dimasukkan benar.");
      };
    };
  };

  //------------------------------
  // Statistics
  //------------------------------

  public query func getStatistics() : async Statistics {
    // Public function - no authorization required
    let totalPhones = phones.size();
    let lostPhones = phones.values().toArray().filter(func(p) { p.status == #lost }).size();
    let stolenPhones = phones.values().toArray().filter(func(p) { p.status == #stolen }).size();
    let activePhones = phones.values().toArray().filter(func(p) { p.status == #active }).size();

    let totalTheftReports = theftReports.size();
    let monthlyReports = _calculateMonthlyReports();
    let statusBreakdown = {
      total = totalPhones;
      lost = lostPhones;
      stolen = stolenPhones;
      active = activePhones;
    };

    let theftReportStats = {
      total = totalTheftReports;
      monthly = monthlyReports;
    };

    {
      totalPhones;
      lostPhones;
      stolenPhones;
      activePhones;
      statusBreakdown;
      theftReportStats;
    };
  };

  func _calculateMonthlyReports() : [Nat] {
    let currentTime = Time.now();
    let monthInNanoSeconds : Int = 30 * 24 * 60 * 60 * 1000000000;
    let oneYearAgo = currentTime - (monthInNanoSeconds * 12);

    let filteredReports : [TheftReport] = theftReports.values().toArray().filter(func(r) { r.timestamp >= oneYearAgo });

    var countsByMonth = Array.tabulate(12, func(_) { 0 });

    for (report in filteredReports.values()) {
      let monthDiff = (currentTime - report.timestamp) / monthInNanoSeconds;
      if (monthDiff >= 0 and monthDiff < 12) {
        let index = Int.abs(monthDiff);
        if (index < 12) {
          let currentCount = countsByMonth[Int.abs(index)];
          countsByMonth := Array.tabulate(
            12,
            func(i) {
              if (i == Int.abs(index)) { currentCount + 1 } else { countsByMonth[i] };
            },
          );
        };
      };
    };

    countsByMonth;
  };

  //------------------------------
  // Notifications Management
  //------------------------------

  func _sendNotification(receiver : Principal, title : Text, message : Text, notifType : Notification.NotificationType, relatedIMEI : ?Text) {
    let notif : Notification = {
      id = 0;
      user = receiver;
      title;
      message;
      timestamp = Time.now();
      notifType;
      relatedIMEI;
      isRead = false;
    };

    let currentNotifications = switch (notifications.get(receiver)) {
      case (null) { List.empty<Notification>() };
      case (?notifs) { notifs };
    };

    currentNotifications.add(notif);
    notifications.add(receiver, currentNotifications);
  };

  public query ({ caller }) func getNotifications(user : Principal) : async [Notification] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own notifications");
    };

    let currentNotifications = switch (notifications.get(user)) {
      case (null) { List.empty<Notification>() };
      case (?notifs) { notifs };
    };
    currentNotifications.toArray();
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (notifications.get(caller)) {
      case (null) {
        Runtime.trap("No notifications found for this user");
      };
      case (?userNotifs) {
        let updatedNotifications = userNotifs.map<Notification, Notification>(
          func(notif) {
            if (notif.id == notificationId) {
              { notif with isRead = true };
            } else { notif };
          }
        );
        notifications.add(caller, updatedNotifications);
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsAsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (notifications.get(caller)) {
      case (null) {
        Runtime.trap("No notifications found for this user");
      };
      case (?userNotifs) {
        let updatedNotifications = userNotifs.map<Notification, Notification>(
          func(notif) { { notif with isRead = true } }
        );
        notifications.add(caller, updatedNotifications);
      };
    };
  };

  //------------------------------
  // Public Search Functions
  //------------------------------

  public query func checkImei(imei : Text) : async ?PhoneStatus {
    // Public function - no authorization required
    switch (phones.get(imei)) {
      case (?phone) { ?phone.status };
      case (null) { null };
    };
  };

  public query func getAllTheftReports() : async [TheftReport] {
    // Public function - no authorization required
    theftReports.values().toArray().sort();
  };

  public query ({ caller }) func getUserPhones(user : Principal) : async [Phone] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own phones");
    };
    phones.values().toArray().filter(
      func(phone) { phone.owner == user }
    );
  };

  //------------------------------
  // Access State Check (Safe API)
  //------------------------------

  public query ({ caller }) func hasUserAccess() : async Bool {
    if (AccessControl.hasPermission(accessControlState, caller, #user)) {
      true;
    } else {
      false;
    };
  };
};
